import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  AuditLogEntry, CriteriaWeights, Judge, JudgeEvaluation, Participant, UserAccount,
} from '../types/scoring';
import { DEFAULT_WEIGHTS, INITIAL_JUDGES } from '../utils/calculations';

export type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });

function readable(err: { code?: string; message?: string } | null | undefined): string {
  if (!err) return 'Terjadi kesalahan.';
  if (err.code === '23505') return 'Kode sudah dipakai peserta lain.';
  if (err.code === '42501' || /row-level security/i.test(err.message ?? '')) return 'Anda tidak berhak melakukan perubahan ini.';
  if (err.code === '23514') return 'Nilai ditolak oleh aturan database (periksa rentang skor atau total bobot).';
  return 'Perubahan gagal disimpan. Periksa koneksi lalu coba lagi.';
}

export function useAwardsData(user: UserAccount) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evaluations, setEvaluations] = useState<JudgeEvaluation[]>([]);
  const [weights, setWeights] = useState<CriteriaWeights>(DEFAULT_WEIGHTS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [judges, setJudges] = useState<Judge[]>(INITIAL_JUDGES);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const isAdmin = user.role === 'ADMIN';

  const loaders = useRef({
    participants: async () => {
      const { data, error } = await supabase.from('participants').select('*').order('created_at').order('id');
      if (error) throw error;
      setParticipants(data.map((r) => ({
        id: r.id, companyName: r.company_name, innovationTitle: r.innovation_title,
        category: r.category, leadPresenter: r.lead_presenter,
      })));
    },
    evaluations: async () => {
      const { data, error } = await supabase.from('evaluations').select('*');
      if (error) throw error;
      setEvaluations(data.map((r) => ({
        judgeId: r.judge_id, participantId: r.participant_id,
        strategi: Number(r.strategi), implementasi: Number(r.implementasi), hasil: Number(r.hasil),
        notes: r.notes, lastUpdated: r.updated_at,
      })));
    },
    weights: async () => {
      const { data, error } = await supabase.from('weights').select('*').eq('id', 1).single();
      if (error) throw error;
      setWeights({ strategi: Number(data.strategi), implementasi: Number(data.implementasi), hasil: Number(data.hasil) });
    },
    audit_log: async () => {
      if (!isAdmin) return;
      const { data, error } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      setAuditLog(data.map((r) => ({ id: String(r.id), timestamp: r.created_at, actor: r.actor, action: r.action, detail: r.detail })));
    },
    judges: async () => {
      if (!isAdmin) {
        setJudges(INITIAL_JUDGES.map((j) => (j.id === user.role ? { ...j, name: user.name, title: user.title, institution: user.institution } : j)));
        return;
      }
      const { data, error } = await supabase.from('profiles').select('*').in('role', ['J1', 'J2']);
      if (error) throw error;
      setJudges(INITIAL_JUDGES.map((j) => {
        const p = data.find((x) => x.role === j.id);
        return p ? { ...j, name: p.name, title: p.title, institution: p.institution } : j;
      }));
    },
  });

  const refreshAll = useCallback(async () => {
    const l = loaders.current;
    await Promise.all([l.participants(), l.evaluations(), l.weights(), l.audit_log(), l.judges()]);
  }, []);

  // Muat data awal + berlangganan perubahan realtime dari perangkat lain.
  useEffect(() => {
    let active = true;
    const timers: Record<string, ReturnType<typeof setTimeout>> = {};
    setLoading(true);
    refreshAll()
      .then(() => active && setLoadError(null))
      .catch(() => active && setLoadError('Gagal memuat data dari server. Periksa koneksi internet.'))
      .finally(() => active && setLoading(false));

    const schedule = (table: 'participants' | 'evaluations' | 'weights' | 'audit_log') => {
      clearTimeout(timers[table]);
      timers[table] = setTimeout(() => {
        loaders.current[table]().then(() => active && setOnline(true)).catch(() => active && setOnline(false));
      }, 150);
    };

    let channel = supabase.channel(`awards-${user.id}`);
    type T = 'participants' | 'evaluations' | 'weights' | 'audit_log';
    const tables: T[] = isAdmin ? ['participants', 'evaluations', 'weights', 'audit_log'] : ['participants', 'evaluations', 'weights'];
    tables.forEach((t) => {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: t }, () => schedule(t));
    });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') { setOnline(true); refreshAll().catch(() => undefined); }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setOnline(false);
    });

    return () => {
      active = false;
      Object.values(timers).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, [user.id, user.role, isAdmin, refreshAll]);

  const saveEvaluation = async (e: JudgeEvaluation): Promise<Result> => {
    if (isAdmin || e.judgeId !== user.role) return fail('Hanya juri yang dapat mengisi nilainya sendiri.');
    const { error } = await supabase.from('evaluations').upsert({
      participant_id: e.participantId, judge_id: e.judgeId,
      strategi: e.strategi, implementasi: e.implementasi, hasil: e.hasil,
      notes: e.notes ?? '', updated_at: new Date().toISOString(),
    }, { onConflict: 'participant_id,judge_id' });
    if (error) return fail(readable(error));
    await loaders.current.evaluations();
    return { ok: true };
  };

  const deleteEvaluation = async (participantId: string): Promise<Result> => {
    if (isAdmin) return fail('Hanya juri yang dapat menghapus nilainya sendiri.');
    const { error } = await supabase.from('evaluations').delete().eq('participant_id', participantId).eq('judge_id', user.role);
    if (error) return fail(readable(error));
    await loaders.current.evaluations();
    return { ok: true };
  };

  const saveWeights = async (w: CriteriaWeights): Promise<Result> => {
    const { data, error } = await supabase.from('weights').update(w).eq('id', 1).select();
    if (error) return fail(readable(error));
    if (!data?.length) return fail('Anda tidak berhak mengubah bobot.');
    await Promise.all([loaders.current.weights(), loaders.current.audit_log()]);
    return { ok: true };
  };

  const addParticipant = async (p: Participant): Promise<Result> => {
    const { error } = await supabase.from('participants').insert({
      id: p.id, company_name: p.companyName, innovation_title: p.innovationTitle,
      category: p.category, lead_presenter: p.leadPresenter,
    });
    if (error) return fail(readable(error));
    await Promise.all([loaders.current.participants(), loaders.current.audit_log()]);
    return { ok: true };
  };

  const resetData = async (): Promise<Result> => {
    const { error } = await supabase.rpc('reset_awards');
    if (error) return fail(readable(error));
    await refreshAll();
    return { ok: true };
  };

  const logEvent = async (action: string, detail: string) => {
    await supabase.rpc('log_event', { p_action: action, p_detail: detail });
    await loaders.current.audit_log();
  };

  return {
    participants, evaluations, weights, auditLog, judges, loading, loadError, online,
    refreshAll, saveEvaluation, deleteEvaluation, saveWeights, addParticipant, resetData, logEvent,
  };
}

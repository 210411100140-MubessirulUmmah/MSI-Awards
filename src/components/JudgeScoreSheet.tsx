import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Minus, Plus, Save, Trash2 } from 'lucide-react';
import { CriteriaWeights, Judge, JudgeEvaluation, Participant } from '../types/scoring';
import { calculateJudgeScore, formatScoreID, parseScoreInput } from '../utils/calculations';

type Field = 'strategi' | 'implementasi' | 'hasil';

const CRITERIA: { key: Field; label: string; hint: string }[] = [
  { key: 'strategi', label: 'Strategi', hint: 'Visi inovasi, diferensiasi solusi, dan roadmap strategi.' },
  { key: 'implementasi', label: 'Implementasi', hint: 'Kualitas eksekusi, kesiapan infrastruktur, dan ketahanan solusi.' },
  { key: 'hasil', label: 'Hasil', hint: 'Dampak operasional, efisiensi bisnis, dan ROI terukur.' },
];

interface Props {
  judge: Judge;
  participants: Participant[];
  evaluations: JudgeEvaluation[];
  weights: CriteriaWeights;
  onSaveEvaluation: (evaluation: JudgeEvaluation) => Promise<boolean>;
  onDeleteEvaluation: (participantId: string) => Promise<boolean>;
}

const toForm = (e?: JudgeEvaluation) => ({
  strategi: e?.strategi != null ? String(e.strategi).replace('.', ',') : '',
  implementasi: e?.implementasi != null ? String(e.implementasi).replace('.', ',') : '',
  hasil: e?.hasil != null ? String(e.hasil).replace('.', ',') : '',
  notes: e?.notes ?? '',
});

const ScoreField: React.FC<{
  label: string; hint: string; weight: number; value: string; error?: string;
  onChange: (v: string) => void;
}> = ({ label, hint, weight, value, error, onChange }) => {
  const parsed = parseScoreInput(value);
  const step = (d: number) => {
    const base = parsed.value ?? 0;
    onChange(String(Math.min(5, Math.max(0, Math.round((base + d) * 2) / 2))).replace('.', ','));
  };
  const id = `score-${label}`;
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${error ? 'border-rose-400 bg-rose-50/60' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-sm font-bold text-slate-900">{label} <span className="font-medium text-slate-500">(bobot {weight}%)</span></label>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        {parsed.value !== null && !error && (
          <span className="text-xs font-mono text-slate-600 shrink-0">+{((parsed.value / 5) * weight).toFixed(1).replace('.', ',')} poin</span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-stretch rounded-xl border border-slate-300 bg-white overflow-hidden">
          <button type="button" aria-label={`Kurangi ${label}`} onClick={() => step(-0.5)} className="w-11 hover:bg-slate-100 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
          <input
            id={id} inputMode="decimal" value={value} placeholder="0 – 5" aria-invalid={Boolean(error)}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 py-2.5 text-center font-mono text-lg font-bold focus:outline-none focus:bg-indigo-50"
          />
          <button type="button" aria-label={`Tambah ${label}`} onClick={() => step(0.5)} className="w-11 hover:bg-slate-100 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-1.5" role="group" aria-label={`Pilih cepat ${label}`}>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(String(n))}
              className={`w-10 h-10 rounded-lg text-sm font-mono font-semibold ${parsed.value === n ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="text-xs text-rose-700 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</p>}
    </div>
  );
};

export const JudgeScoreSheet: React.FC<Props> = ({ judge, participants, evaluations, weights, onSaveEvaluation, onDeleteEvaluation }) => {
  const [selectedId, setSelectedId] = useState(participants[0]?.id ?? '');
  const participant = participants.find((p) => p.id === selectedId) ?? participants[0];
  const saved = evaluations.find((e) => e.participantId === participant?.id && e.judgeId === judge.id);
  const [form, setForm] = useState(() => toForm(saved));
  const [touched, setTouched] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Muat ulang form hanya saat peserta berganti atau data tersimpan berubah.
  const savedKey = JSON.stringify(saved ?? null);
  useEffect(() => { setForm(toForm(saved)); setTouched(false); }, [participant?.id, savedKey]);

  const parsed = useMemo(() => ({
    strategi: parseScoreInput(form.strategi),
    implementasi: parseScoreInput(form.implementasi),
    hasil: parseScoreInput(form.hasil),
  }), [form]);

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(saved));
  const filled = CRITERIA.every((c) => parsed[c.key].value !== null);
  const hasError = CRITERIA.some((c) => parsed[c.key].error);
  const preview = filled && !hasError
    ? calculateJudgeScore({ judgeId: judge.id, participantId: participant?.id ?? '', strategi: parsed.strategi.value, implementasi: parsed.implementasi.value, hasil: parsed.hasil.value }, weights)
    : null;
  const doneCount = participants.filter((p) => calculateJudgeScore(evaluations.find((e) => e.participantId === p.id && e.judgeId === judge.id), weights) !== null).length;

  const select = (id: string) => {
    if (id === participant?.id) return;
    if (dirty && !window.confirm('Ada perubahan yang belum disimpan. Pindah peserta dan buang perubahan?')) return;
    setSelectedId(id); setNotice(null);
  };

  const [busy, setBusy] = useState(false);

  const save = async () => {
    setTouched(true);
    if (!filled || hasError || !participant) {
      setNotice('Belum bisa disimpan: lengkapi semua kriteria dengan skor 0 sampai 5.');
      return;
    }
    setBusy(true);
    const ok = await onSaveEvaluation({
      judgeId: judge.id, participantId: participant.id,
      strategi: parsed.strategi.value, implementasi: parsed.implementasi.value, hasil: parsed.hasil.value,
      notes: form.notes.trim(), lastUpdated: new Date().toISOString(),
    });
    setBusy(false);
    setNotice(ok ? `Penilaian ${participant.id} tersimpan.` : 'Belum tersimpan, periksa koneksi lalu coba lagi.');
  };

  const remove = async () => {
    if (!participant || !saved) return;
    if (!window.confirm(`Hapus nilai Anda untuk ${participant.id}? Peserta akan kembali berstatus belum lengkap.`)) return;
    setBusy(true);
    const ok = await onDeleteEvaluation(participant.id);
    setBusy(false);
    setNotice(ok ? `Nilai ${participant.id} dihapus.` : 'Belum terhapus, periksa koneksi lalu coba lagi.');
  };

  if (!participant) return <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">Belum ada peserta yang perlu dinilai. Hubungi administrator.</div>;

  const pct = participants.length ? (doneCount / participants.length) * 100 : 0;
  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{judge.name}</h2>
          <p className="text-xs text-slate-500">{judge.title} · {judge.institution}</p>
        </div>
        <div className="sm:w-64">
          <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Progres penilaian Anda</span><b>{doneCount}/{participants.length}</b></div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Pilih peserta">
        {participants.map((p) => {
          const sc = calculateJudgeScore(evaluations.find((e) => e.participantId === p.id && e.judgeId === judge.id), weights);
          const active = p.id === participant.id;
          return (
            <button key={p.id} role="tab" aria-selected={active} onClick={() => select(p.id)}
              className={`shrink-0 min-w-44 text-left p-3 rounded-xl border transition-colors ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs">{p.id}</span>
                {sc !== null ? <span className="text-xs font-mono font-bold">{formatScoreID(sc)}</span> : <span className={`text-[11px] ${active ? 'text-amber-300' : 'text-amber-700'}`}>Belum diisi</span>}
              </div>
              <div className="text-xs truncate mt-1 opacity-90">{p.companyName}</div>
            </button>
          );
        })}
      </div>

      {notice && (
        <div role="status" className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-3 ${notice.startsWith('Belum') ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <span className="flex items-center gap-2">{notice.startsWith('Belum') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}{notice}</span>
          <button onClick={() => setNotice(null)} className="underline text-xs font-semibold">Tutup</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <p className="text-xs text-slate-500">{participant.category}</p>
            <h3 className="text-base font-bold text-slate-900">{participant.id} · {participant.companyName}</h3>
            <p className="text-sm text-slate-600">{participant.innovationTitle}</p>
            <p className="text-xs text-slate-400 mt-1">Presenter: {participant.leadPresenter}</p>
          </div>
          {CRITERIA.map((c) => (
            <ScoreField key={c.key} label={c.label} hint={c.hint} weight={weights[c.key]} value={form[c.key]}
              error={parsed[c.key].error ?? (touched && form[c.key].trim() === '' ? 'Skor wajib diisi' : undefined)}
              onChange={(v) => { setForm((f) => ({ ...f, [c.key]: v })); setNotice(null); }} />
          ))}
          <div>
            <label htmlFor="notes" className="text-sm font-bold text-slate-900">Catatan evaluasi <span className="font-medium text-slate-500">(opsional)</span></label>
            <textarea id="notes" rows={3} value={form.notes} maxLength={600} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Masukan atau pertimbangan kualitatif untuk peserta ini"
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none" />
            <div className="text-right text-[11px] text-slate-400">{form.notes.length}/600</div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6">
            <p className="text-xs text-slate-400">Nilai Anda untuk {participant.id}</p>
            {preview !== null ? (
              <><div className="text-5xl font-extrabold font-mono mt-3">{formatScoreID(preview)}</div><p className="text-xs text-slate-400">dari 100</p></>
            ) : (
              <><div className="text-2xl font-bold text-amber-400 mt-3">Belum lengkap</div><p className="text-xs text-slate-400">{hasError ? 'Perbaiki skor yang ditolak' : 'Isi ketiga kriteria (0 sampai 5)'}</p></>
            )}
            <div className="mt-5 pt-4 border-t border-slate-700 text-xs font-mono space-y-1.5 text-slate-300">
              {CRITERIA.map((c) => <div key={c.key} className="flex justify-between"><span>{c.label}</span><span>{parsed[c.key].value !== null && !parsed[c.key].error ? `${String(parsed[c.key].value).replace('.', ',')} ÷ 5 × ${weights[c.key]}` : '-'}</span></div>)}
            </div>
          </div>
          <p className="text-xs text-slate-500 px-1">{saved?.lastUpdated ? `Terakhir disimpan ${new Date(saved.lastUpdated).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Belum pernah disimpan'}</p>
        </aside>
      </div>

      <div className="fixed bottom-0 inset-x-0 lg:static bg-white/95 backdrop-blur lg:bg-transparent border-t lg:border-0 border-slate-200 p-3 lg:p-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <span className={`text-xs ${dirty ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>{dirty ? 'Ada perubahan belum disimpan' : 'Semua perubahan tersimpan'}</span>
          <div className="flex gap-2">
            {saved && <button onClick={remove} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 text-sm font-semibold"><Trash2 className="w-4 h-4" />Hapus nilai</button>}
            <button onClick={save} disabled={!dirty || busy} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold"><Save className="w-4 h-4" />{busy ? 'Menyimpan…' : 'Simpan nilai'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

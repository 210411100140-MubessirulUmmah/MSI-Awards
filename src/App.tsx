import React, { useState } from 'react';
import { CriteriaWeights, JudgeEvaluation, Participant, UserAccount } from './types/scoring';
import { compileCompanyResults, formatScoreID, nextParticipantId } from './utils/calculations';
import { isSupabaseConfigured } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useAwardsData } from './hooks/useAwardsData';
import { Header, AdminTab } from './components/Header';
import { LoginPortal } from './components/Auth/LoginPortal';
import { DashboardSummary } from './components/DashboardSummary';
import { AnalyticsCharts } from './components/Charts/AnalyticsCharts';
import { RecapTable } from './components/RecapTable';
import { JudgeScoreSheet } from './components/JudgeScoreSheet';
import { WeightsPanel } from './components/WeightsPanel';
import { OfficialReportModal } from './components/OfficialReportModal';
import { EvaluationDetailModal } from './components/EvaluationDetailModal';
import { AddParticipantModal } from './components/AddParticipantModal';
import { RiwayatPanel } from './components/RiwayatPanel';

const Screen: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen grid place-items-center p-6 bg-slate-50">
    <div className="max-w-md text-center space-y-3">
      <div className="w-10 h-10 mx-auto rounded-lg bg-[#0f1b2d] text-white grid place-items-center text-sm font-bold">MSI</div>
      <h1 className="font-display text-2xl text-slate-900">{title}</h1>
      <div className="text-sm text-slate-600 leading-relaxed">{children}</div>
    </div>
  </div>
);

export default function App() {
  return isSupabaseConfigured ? <AuthGate /> : (
    <Screen title="Konfigurasi belum lengkap">
      Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada berkas <code>.env</code> (lihat README), lalu jalankan ulang aplikasi.
    </Screen>
  );
}

function AuthGate() {
  const { user, ready, notice, signIn, signOut } = useAuth();
  if (!ready) return <Screen title="Memuat…" />;
  if (!user) return <LoginPortal onSignIn={signIn} notice={notice} />;
  return <Workspace key={user.id} currentUser={user} onSignOut={signOut} />;
}

function Workspace({ currentUser, onSignOut }: { currentUser: UserAccount; onSignOut: () => void }) {
  const data = useAwardsData(currentUser);
  const { participants, evaluations, weights, auditLog, judges } = data;

  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [selectedDetailResult, setSelectedDetailResult] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  const notify = (text: string, error = false) => {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 3500);
  };

  if (data.loading) return <Screen title="Memuat data…" />;
  if (data.loadError) {
    return (
      <Screen title="Data belum dapat dimuat">
        <p>{data.loadError}</p>
        <button onClick={() => data.refreshAll()} className="mt-4 px-4 py-2 rounded-lg bg-[#0f1b2d] text-white text-sm font-medium">Coba lagi</button>
      </Screen>
    );
  }

  const results = compileCompanyResults(participants, evaluations, weights);
  const activeJudge = judges.find((j) => j.id === currentUser.role) || judges[0];

  const handleSaveEvaluation = async (e: JudgeEvaluation): Promise<boolean> => {
    const r = await data.saveEvaluation(e);
    if (!r.ok) notify(r.error, true);
    return r.ok;
  };
  const handleDeleteEvaluation = async (participantId: string): Promise<boolean> => {
    const r = await data.deleteEvaluation(participantId);
    if (!r.ok) notify(r.error, true);
    return r.ok;
  };
  const handleSaveWeights = async (w: CriteriaWeights): Promise<boolean> => {
    const r = await data.saveWeights(w);
    if (!r.ok) notify(r.error, true);
    return r.ok;
  };
  const handleAddParticipant = async (p: Participant): Promise<string | null> => {
    const r = await data.addParticipant(p);
    return r.ok ? null : r.error;
  };
  const handleResetData = async () => {
    if (!window.confirm('Kembalikan semua peserta, nilai, dan bobot ke data acuan awal? Nilai yang sudah diisi juri akan hilang.')) return;
    const r = await data.resetData();
    notify(r.ok ? 'Data dikembalikan ke acuan awal.' : r.error, !r.ok);
  };

  // Export CSV (pemisah ';' agar langsung rapi di Excel Indonesia)
  const handleExportCSV = () => {
    const q = (v: string | number | null | undefined) =>
      `"${String(v ?? '').replace(/"/g, '""')}"`;
    const n = (v: number | null | undefined) => (v == null ? '' : String(v).replace('.', ','));
    const headers = [
      'Peringkat', 'Kode', 'Perusahaan', 'Kategori',
      'J1 Strategi', 'J1 Implementasi', 'J1 Hasil', 'Nilai J1',
      'J2 Strategi', 'J2 Implementasi', 'J2 Hasil', 'Nilai J2',
      'Nilai Perusahaan', 'Status',
    ];
    const rows = results.map((r) => [
      r.rank ?? '',
      q(r.participant.id), q(r.participant.companyName), q(r.participant.category),
      n(r.j1Evaluation?.strategi), n(r.j1Evaluation?.implementasi), n(r.j1Evaluation?.hasil),
      r.j1Score !== null ? formatScoreID(r.j1Score) : '',
      n(r.j2Evaluation?.strategi), n(r.j2Evaluation?.implementasi), n(r.j2Evaluation?.hasil),
      r.j2Score !== null ? formatScoreID(r.j2Score) : '',
      r.finalScore !== null ? formatScoreID(r.finalScore) : '',
      q(r.status),
    ]);
    const csv = '\uFEFF' + [headers.map(q), ...rows].map((row) => row.join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekapitulasi_penilaian_awards_msi_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    data.logEvent('Ekspor CSV', `${results.length} peserta`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Header with strict authenticated user controls */}
      <Header
        currentUser={currentUser}
        onLogout={onSignOut}
        adminTab={adminTab}
        onAdminTabChange={setAdminTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        onOpenAddParticipant={() => setIsAddParticipantOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* =========================================
            ADMINISTRATOR VIEW (Full Access)
            ========================================= */}
        {currentUser.role === 'ADMIN' && (
          <>
            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                <DashboardSummary results={results} weights={weights} />
                <AnalyticsCharts results={results} weights={weights} />
              </div>
            )}

            {adminTab === 'recap' && (
              <div className="space-y-6">
                <RecapTable
                  results={results}
                  weights={weights}
                  onSelectDetail={(res) => setSelectedDetailResult(res.participant.id)}
                  onOpenAddParticipant={() => setIsAddParticipantOpen(true)}
                />
              </div>
            )}

            {adminTab === 'log' && <RiwayatPanel log={auditLog} />}

            {adminTab === 'weights' && (
              <div className="space-y-6">
                <WeightsPanel
                  weights={weights}
                  onSaveWeights={handleSaveWeights}
                  onNavigateToRecap={() => setAdminTab('recap')}
                />
              </div>
            )}
          </>
        )}

        {/* =========================================
            JUDGE VIEW (J1 or J2 Strictly Scoped)
            ========================================= */}
        {currentUser.role !== 'ADMIN' && (
          <>
            <JudgeScoreSheet
              judge={activeJudge}
              participants={participants}
              evaluations={evaluations}
              weights={weights}
              onSaveEvaluation={handleSaveEvaluation}
              onDeleteEvaluation={handleDeleteEvaluation}
            />
          </>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-4 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">MSI Group</span>
            <span>·</span>
            <span>Innovation & Excellence Awards 2026</span>
          </div>
          <div className="text-slate-400">
            Sesi: <strong>{currentUser.name}</strong> ({currentUser.role})
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <OfficialReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        results={results}
        weights={weights}
        judges={judges}
      />

      <EvaluationDetailModal
        isOpen={Boolean(selectedDetailResult)}
        onClose={() => setSelectedDetailResult(null)}
        result={results.find((r) => r.participant.id === selectedDetailResult) ?? null}
        weights={weights}
        judges={judges}
      />

      <AddParticipantModal
        isOpen={isAddParticipantOpen}
        onClose={() => setIsAddParticipantOpen(false)}
        onAddParticipant={handleAddParticipant}
        nextId={nextParticipantId(participants)}
        existingIds={participants.map((p) => p.id)}
      />
      {toast && (
        <div role="status" className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.error ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { CompanyEvaluationResult, CriteriaWeights } from '../types/scoring';
import { formatScoreID } from '../utils/calculations';

interface DashboardSummaryProps {
  results: CompanyEvaluationResult[];
  weights: CriteriaWeights;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  results,
  weights,
}) => {
  const totalParticipants = results.length;
  const completedCount = results.filter((r) => r.status === 'Lengkap').length;
  const isAllComplete = totalParticipants > 0 && completedCount === totalParticipants;

  const completedScores = results
    .filter((r) => r.finalScore !== null)
    .map((r) => r.finalScore as number);

  const averageOverallScore =
    completedScores.length > 0
      ? completedScores.reduce((acc, curr) => acc + curr, 0) /
        completedScores.length
      : null;

  const ranked = [...results]
    .filter((r) => r.finalScore !== null)
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

  const topPerformer = ranked[0];

  return (
    <div className="space-y-4">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Peserta */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Peserta Finalis
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {totalParticipants}
            </span>
            <span className="text-xs text-slate-500">perusahaan</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {results.map((r) => r.participant.id).join(', ')}
          </span>
        </div>

        {/* Card 2: Kelengkapan */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Status Kelengkapan
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                isAllComplete ? 'text-emerald-700' : 'text-amber-600'
              }`}
            >
              {completedCount}/{totalParticipants}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAllComplete
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isAllComplete ? 'Lengkap' : 'Dalam Proses'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isAllComplete
              ? 'Seluruh juri (J1 & J2) selesai menilai'
              : 'Menunggu kelengkapan isian juri'}
          </span>
        </div>

        {/* Card 3: Peringkat Tertinggi */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Nilai Tertinggi
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {topPerformer ? formatScoreID(topPerformer.finalScore) : '-'}
            </span>
            {topPerformer && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
                {topPerformer.participant.id}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 truncate block mt-1" title={topPerformer?.participant.companyName}>
            {topPerformer ? topPerformer.participant.companyName : 'Menunggu hasil'}
          </span>
        </div>

        {/* Card 4: Rata-rata Skor */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Rata-rata Nilai
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {averageOverallScore !== null ? formatScoreID(averageOverallScore) : '-'}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Formula: S ({weights.strategi}%) · I ({weights.implementasi}%) · H ({weights.hasil}%)
          </span>
        </div>
      </div>

      {/* Clean Leaderboard Summary Strip */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">
            Klasemen Nilai Akhir:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {ranked.map((res) => (
            <div
              key={res.participant.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
            >
              <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono font-bold text-[11px] flex items-center justify-center">
                {res.rank}
              </span>
              <span className="font-mono font-bold text-slate-900">
                {res.participant.id}
              </span>
              <span className="text-slate-600 truncate max-w-[150px]">
                {res.participant.companyName}
              </span>
              <span className="font-mono font-extrabold text-slate-900 ml-1">
                {formatScoreID(res.finalScore)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

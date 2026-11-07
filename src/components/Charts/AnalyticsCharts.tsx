import React, { useState } from 'react';
import { CompanyEvaluationResult, CriteriaWeights } from '../../types/scoring';
import { formatScoreID } from '../../utils/calculations';
import { BarChart3, TrendingUp, Award, Layers } from 'lucide-react';

interface AnalyticsChartsProps {
  results: CompanyEvaluationResult[];
  weights: CriteriaWeights;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  results,
  weights,
}) => {
  const [chartView, setChartView] = useState<'comparison' | 'criteria'>('comparison');

  // Filter completed results
  const completed = results.filter((r) => r.finalScore !== null);

  // Calculate average per criteria across participants
  const criteriaAvg = {
    strategi: 0,
    implementasi: 0,
    hasil: 0,
  };

  let count = 0;
  results.forEach((r) => {
    if (r.j1Evaluation && r.j2Evaluation && r.j1Score !== null && r.j2Score !== null) {
      const s = ((r.j1Evaluation.strategi || 0) + (r.j2Evaluation.strategi || 0)) / 2;
      const i = ((r.j1Evaluation.implementasi || 0) + (r.j2Evaluation.implementasi || 0)) / 2;
      const h = ((r.j1Evaluation.hasil || 0) + (r.j2Evaluation.hasil || 0)) / 2;
      criteriaAvg.strategi += s;
      criteriaAvg.implementasi += i;
      criteriaAvg.hasil += h;
      count++;
    }
  });

  if (count > 0) {
    criteriaAvg.strategi = Math.round((criteriaAvg.strategi / count) * 10) / 10;
    criteriaAvg.implementasi = Math.round((criteriaAvg.implementasi / count) * 10) / 10;
    criteriaAvg.hasil = Math.round((criteriaAvg.hasil / count) * 10) / 10;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
      {/* Header and Chart Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Analisis Komparatif & Visualisasi Skor
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi distribusi nilai dewan juri dan performa per kriteria inovasi
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setChartView('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              chartView === 'comparison'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Komparasi Juri (J1 vs J2)
          </button>
          <button
            onClick={() => setChartView('criteria')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              chartView === 'criteria'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rata-rata per Kriteria
          </button>
        </div>
      </div>

      {chartView === 'comparison' ? (
        /* Chart 1: Grouped Comparison Chart */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.map((res) => {
              const j1 = res.j1Score || 0;
              const j2 = res.j2Score || 0;
              const finalVal = res.finalScore || 0;

              // Percentage for bars based on scale 0-100
              const j1Pct = Math.min(100, Math.max(0, j1));
              const j2Pct = Math.min(100, Math.max(0, j2));
              const finalPct = Math.min(100, Math.max(0, finalVal));

              return (
                <div
                  key={res.participant.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* Participant Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {res.participant.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-1">
                        {res.participant.companyName}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {res.participant.innovationTitle}
                      </p>
                    </div>

                    {res.finalScore !== null && (
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-lg text-slate-900">
                          {formatScoreID(res.finalScore)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Rata-rata</span>
                      </div>
                    )}
                  </div>

                  {/* Horizontal Bar Visuals */}
                  <div className="space-y-2.5 pt-1">
                    {/* J1 Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                        <span>Juri 1 (J1)</span>
                        <span className="font-mono font-bold text-slate-900">
                          {res.j1Score !== null ? formatScoreID(res.j1Score) : '-'}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-800 rounded-full transition-all duration-500"
                          style={{ width: `${j1Pct}%` }}
                        />
                      </div>
                    </div>

                    {/* J2 Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                        <span>Juri 2 (J2)</span>
                        <span className="font-mono font-bold text-slate-900">
                          {res.j2Score !== null ? formatScoreID(res.j2Score) : '-'}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-600 rounded-full transition-all duration-500"
                          style={{ width: `${j2Pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Final Average Bar */}
                    <div className="pt-1 border-t border-slate-200/80">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-900 mb-1">
                        <span>Nilai Akhir Perusahaan</span>
                        <span className="font-mono font-extrabold text-amber-600">
                          {res.finalScore !== null ? formatScoreID(res.finalScore) : 'Belum Lengkap'}
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 shadow-2xs"
                          style={{ width: `${finalPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-800" />
              <span>Juri 1 (Teknologi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600" />
              <span>Juri 2 (Strategi Bisnis)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Nilai Rata-rata Final </span>
            </div>
          </div>
        </div>
      ) : (
        /* Chart 2: Criteria Breakdown Chart */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Strategi */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Kriteria 1
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  Bobot {weights.strategi}%
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Strategi Inovasi
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {criteriaAvg.strategi.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-xs text-slate-400">/ 5,0 rata-rata</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-800 rounded-full"
                  style={{ width: `${(criteriaAvg.strategi / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Kontribusi rata-rata: {((criteriaAvg.strategi / 5) * weights.strategi).toFixed(1)} poin dari total {weights.strategi}%
              </p>
            </div>

            {/* 2. Implementasi */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Kriteria 2
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  Bobot {weights.implementasi}%
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Kualitas Implementasi
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {criteriaAvg.implementasi.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-xs text-slate-400">/ 5,0 rata-rata</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-800 rounded-full"
                  style={{ width: `${(criteriaAvg.implementasi / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Kontribusi rata-rata: {((criteriaAvg.implementasi / 5) * weights.implementasi).toFixed(1)} poin dari total {weights.implementasi}%
              </p>
            </div>

            {/* 3. Hasil */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Kriteria 3
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  Bobot {weights.hasil}%
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Dampak & Hasil Nyata
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {criteriaAvg.hasil.toFixed(1).replace('.', ',')}
                </span>
                <span className="text-xs text-slate-400">/ 5,0 rata-rata</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-800 rounded-full"
                  style={{ width: `${(criteriaAvg.hasil / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Kontribusi rata-rata: {((criteriaAvg.hasil / 5) * weights.hasil).toFixed(1)} poin dari total {weights.hasil}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

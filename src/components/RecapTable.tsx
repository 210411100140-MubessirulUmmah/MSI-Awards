import React, { useState } from 'react';
import { Search, Plus, Eye } from 'lucide-react';
import {
  CompanyEvaluationResult,
  CriteriaWeights,
} from '../types/scoring';
import { formatScoreID } from '../utils/calculations';

interface RecapTableProps {
  results: CompanyEvaluationResult[];
  weights: CriteriaWeights;
  onSelectDetail: (result: CompanyEvaluationResult) => void;
  onOpenAddParticipant: () => void;
}

export const RecapTable: React.FC<RecapTableProps> = ({
  results,
  weights,
  onSelectDetail,
  onOpenAddParticipant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResults = results.filter((item) => {
    return (
      item.participant.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.participant.companyName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.participant.innovationTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Header and Controls */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Tabel Rekapitulasi Nilai Dewan Juri
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komposisi Bobot: Strategi ({weights.strategi}%), Implementasi ({weights.implementasi}%), Hasil ({weights.hasil}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-44 sm:w-56"
            />
          </div>

          {/* Add Participant Button */}
          <button
            onClick={onOpenAddParticipant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Main Table Matching The Official Document Layout */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <th className="py-3 px-4">Peserta</th>
              <th className="py-3 px-3">Juri</th>
              <th className="py-3 px-3 text-center">Strategi</th>
              <th className="py-3 px-3 text-center">Implementasi</th>
              <th className="py-3 px-3 text-center">Hasil</th>
              <th className="py-3 px-4 text-right">Nilai Juri</th>
              <th className="py-3 px-4 text-center bg-slate-100/70 border-l border-r border-slate-200 font-bold text-slate-900">
                Nilai Perusahaan
              </th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredResults.map((res) => {
              const j1 = res.j1Evaluation;
              const j2 = res.j2Evaluation;

              return (
                <React.Fragment key={res.participant.id}>
                  {/* Juri 1 Row */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    {/* Peserta Spanning 2 Rows */}
                    <td
                      rowSpan={2}
                      className="py-3.5 px-4 align-top border-r border-slate-200 bg-white"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {res.participant.id}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {res.participant.companyName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {res.participant.innovationTitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* J1 Code */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      J1
                    </td>

                    {/* J1 Scores */}
                    <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                      {j1?.strategi !== null && j1?.strategi !== undefined ? (
                        j1.strategi
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                      {j1?.implementasi !== null && j1?.implementasi !== undefined ? (
                        j1.implementasi
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                      {j1?.hasil !== null && j1?.hasil !== undefined ? (
                        j1.hasil
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* J1 Calculated Score */}
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatScoreID(res.j1Score)}
                    </td>

                    {/* Nilai Perusahaan Spanning 2 Rows */}
                    <td
                      rowSpan={2}
                      className="py-3.5 px-4 text-center align-middle border-l border-r border-slate-200 bg-slate-50/70"
                    >
                      {res.finalScore !== null ? (
                        <div>
                          <span className="font-mono font-extrabold text-base text-slate-900">
                            {formatScoreID(res.finalScore)}
                          </span>
                          {res.rank && (
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                              Peringkat #{res.rank}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Belum lengkap
                        </span>
                      )}
                    </td>

                    {/* Status Spanning 2 Rows */}
                    <td
                      rowSpan={2}
                      className="py-3.5 px-4 text-center align-middle border-r border-slate-200"
                    >
                      {res.status === 'Lengkap' ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Lengkap
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {res.status}
                        </span>
                      )}
                    </td>

                    {/* Detail Action Spanning 2 Rows */}
                    <td
                      rowSpan={2}
                      className="py-3.5 px-3 text-center align-middle"
                    >
                      <button
                        onClick={() => onSelectDetail(res)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Lihat rincian evaluasi dan catatan"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Juri 2 Row */}
                  <tr className="hover:bg-slate-50/70 transition-colors border-b-2 border-slate-200">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      J2
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                      {j2?.strategi !== null && j2?.strategi !== undefined ? (
                        j2.strategi
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                      {j2?.implementasi !== null && j2?.implementasi !== undefined ? (
                        j2.implementasi
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                      {j2?.hasil !== null && j2?.hasil !== undefined ? (
                        j2.hasil
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatScoreID(res.j2Score)}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <span>
          Rumus: <code className="text-slate-700 font-mono">(Strategi ÷ 5 × {weights.strategi}%) + (Implementasi ÷ 5 × {weights.implementasi}%) + (Hasil ÷ 5 × {weights.hasil}%)</code>
        </span>
        <span className="text-[11px] text-slate-400">
          Nilai akhir = rata-rata nilai juri (belum dibulatkan), dibulatkan 1 desimal
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import {
  X,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  CompanyEvaluationResult,
  CriteriaWeights,
  Judge,
} from '../types/scoring';
import { formatScoreID } from '../utils/calculations';

interface EvaluationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CompanyEvaluationResult | null;
  weights: CriteriaWeights;
  judges: Judge[];
}

export const EvaluationDetailModal: React.FC<EvaluationDetailModalProps> = ({
  isOpen,
  onClose,
  result,
  weights,
  judges,
}) => {
  if (!isOpen || !result) return null;
  return <DetailBody result={result} weights={weights} judges={judges} onClose={onClose} />;
};

const DetailBody: React.FC<Omit<EvaluationDetailModalProps, 'isOpen'> & { result: CompanyEvaluationResult }> = ({
  onClose,
  result,
  weights,
  judges,
}) => {
  const { participant, j1Evaluation, j2Evaluation, j1Score, j2Score, finalScore, status, rank } = result;
  const judge1 = judges.find((j) => j.id === 'J1');
  const judge2 = judges.find((j) => j.id === 'J2');

  return (
    <div role="dialog" aria-modal="true" aria-label="Rincian evaluasi" onKeyDown={(e) => e.key === 'Escape' && onClose()} onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200">
              {participant.id}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {participant.companyName}
              </h3>
              <p className="text-xs text-slate-500">
                Rincian Evaluasi & Catatan Dewan Juri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Innovation Meta */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-indigo-700">
              {participant.category}
            </div>
            <div className="text-sm font-bold text-slate-900">
              {participant.innovationTitle}
            </div>
            <div className="text-slate-500 text-[11px]">
              Presenter / Lead: {participant.leadPresenter}
            </div>
          </div>

          {/* Final Score Banner */}
          <div className="p-4 rounded-xl bg-indigo-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-200 font-semibold">
                Nilai Akhir Rata-rata Perusahaan
              </span>
              <div className="text-3xl font-extrabold font-mono mt-1">
                {finalScore !== null ? formatScoreID(finalScore) : 'Belum Lengkap'}
              </div>
              <p className="text-[11px] text-indigo-300 mt-0.5">
                {finalScore !== null
                  ? `Rata-rata: (${formatScoreID(j1Score)} + ${formatScoreID(j2Score)}) ÷ 2`
                  : 'Menunggu kedua dewan juri melengkapi lembar nilai'}
              </p>
            </div>
            {rank && (
              <div className="text-right">
                <span className="text-xs text-indigo-200 block">Peringkat</span>
                <span className="text-2xl font-black text-amber-300 font-mono">
                  #{rank}
                </span>
              </div>
            )}
          </div>

          {/* Judges Breakdown (J1 & J2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* J1 Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
                    J1
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{judge1?.name}</div>
                    <div className="text-[10px] text-slate-500">{judge1?.title}</div>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-sm text-indigo-700">
                  {formatScoreID(j1Score)}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Strategi ({weights.strategi}%):</span>
                  <span className="font-bold text-slate-800">
                    {j1Evaluation?.strategi != null ? `${j1Evaluation.strategi} / 5` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Implementasi ({weights.implementasi}%):</span>
                  <span className="font-bold text-slate-800">
                    {j1Evaluation?.implementasi != null ? `${j1Evaluation.implementasi} / 5` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hasil ({weights.hasil}%):</span>
                  <span className="font-bold text-slate-800">
                    {j1Evaluation?.hasil != null ? `${j1Evaluation.hasil} / 5` : '-'}
                  </span>
                </div>
              </div>

              {j1Evaluation?.notes && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 italic">
                  "{j1Evaluation.notes}"
                </div>
              )}
            </div>

            {/* J2 Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-emerald-600 text-white px-2 py-0.5 rounded">
                    J2
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{judge2?.name}</div>
                    <div className="text-[10px] text-slate-500">{judge2?.title}</div>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-sm text-emerald-700">
                  {formatScoreID(j2Score)}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Strategi ({weights.strategi}%):</span>
                  <span className="font-bold text-slate-800">
                    {j2Evaluation?.strategi != null ? `${j2Evaluation.strategi} / 5` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Implementasi ({weights.implementasi}%):</span>
                  <span className="font-bold text-slate-800">
                    {j2Evaluation?.implementasi != null ? `${j2Evaluation.implementasi} / 5` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hasil ({weights.hasil}%):</span>
                  <span className="font-bold text-slate-800">
                    {j2Evaluation?.hasil != null ? `${j2Evaluation.hasil} / 5` : '-'}
                  </span>
                </div>
              </div>

              {j2Evaluation?.notes && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 italic">
                  "{j2Evaluation.notes}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

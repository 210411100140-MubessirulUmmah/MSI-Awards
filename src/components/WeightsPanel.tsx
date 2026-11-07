import React, { useEffect, useState } from 'react';
import { Sliders, CheckCircle2, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { CriteriaWeights } from '../types/scoring';
import {
  DEFAULT_WEIGHTS,
  ALTERNATE_TEST_WEIGHTS,
  validateWeights,
} from '../utils/calculations';

interface WeightsPanelProps {
  weights: CriteriaWeights;
  onSaveWeights: (newWeights: CriteriaWeights) => Promise<boolean>;
  onNavigateToRecap: () => void;
}

export const WeightsPanel: React.FC<WeightsPanelProps> = ({
  weights,
  onSaveWeights,
  onNavigateToRecap,
}) => {
  const [localWeights, setLocalWeights] = useState<CriteriaWeights>({ ...weights });
  const [savedFeedback, setSavedFeedback] = useState(false);
  const weightsKey = JSON.stringify(weights);
  useEffect(() => { setLocalWeights({ ...weights }); }, [weightsKey]);

  const total =
    Number(localWeights.strategi || 0) +
    Number(localWeights.implementasi || 0) +
    Number(localWeights.hasil || 0);

  const isExact100 = Math.abs(total - 100) < 0.001;

  const handleChange = (field: keyof CriteriaWeights, valueStr: string) => {
    const val = Number(valueStr);
    setLocalWeights((prev) => ({
      ...prev,
      [field]: isNaN(val) ? 0 : Math.min(100, Math.max(0, val)),
    }));
    setSavedFeedback(false);
  };

  const handleApplyPreset = (preset: CriteriaWeights) => {
    setLocalWeights(preset);
    setSavedFeedback(false);
  };

  const handleSave = async () => {
    const validation = validateWeights(localWeights);
    if (!validation.isValid) return;
    if (!(await onSaveWeights(localWeights))) return;
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* Title */}
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pengaturan Kriteria & Bobot Penilaian
              </h2>
              <p className="text-xs text-slate-500">
                Total bobot harus berjumlah tepat 100% agar perhitungan sah
              </p>
            </div>
          </div>

          <button
            onClick={() => handleApplyPreset(DEFAULT_WEIGHTS)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 40-35-25</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Pilihan Preset:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset(DEFAULT_WEIGHTS)}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              localWeights.strategi === 40 &&
              localWeights.implementasi === 35 &&
              localWeights.hasil === 25
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Standar: 40% · 35% · 25%
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(ALTERNATE_TEST_WEIGHTS)}
            className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
              localWeights.strategi === 50 &&
              localWeights.implementasi === 30 &&
              localWeights.hasil === 20
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Skenario Uji: 50% · 30% · 20%
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-2">
          {/* Strategi */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  1. Bobot Strategi
                </span>
                <span className="text-[11px] text-slate-500">
                  Visi inovasi, keselarasan strategi, roadmap pengembangan
                </span>
              </div>
              <span className="font-mono font-bold text-base text-slate-900">
                {localWeights.strategi}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={localWeights.strategi}
                onChange={(e) => handleChange('strategi', e.target.value)}
                className="flex-1 accent-slate-900 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.strategi}
                onChange={(e) => handleChange('strategi', e.target.value)}
                className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Implementasi */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  2. Bobot Implementasi
                </span>
                <span className="text-[11px] text-slate-500">
                  Kualitas eksekusi, kesiapan infrastruktur, manajemen risiko
                </span>
              </div>
              <span className="font-mono font-bold text-base text-slate-900">
                {localWeights.implementasi}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={localWeights.implementasi}
                onChange={(e) => handleChange('implementasi', e.target.value)}
                className="flex-1 accent-slate-900 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.implementasi}
                onChange={(e) => handleChange('implementasi', e.target.value)}
                className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Hasil */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  3. Bobot Hasil
                </span>
                <span className="text-[11px] text-slate-500">
                  Dampak bisnis terukur, efisiensi operasional, return on investment
                </span>
              </div>
              <span className="font-mono font-bold text-base text-slate-900">
                {localWeights.hasil}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={localWeights.hasil}
                onChange={(e) => handleChange('hasil', e.target.value)}
                className="flex-1 accent-slate-900 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={localWeights.hasil}
                onChange={(e) => handleChange('hasil', e.target.value)}
                className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Total Verification */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            isExact100
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isExact100 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold">
                Total Bobot: <span className="font-mono text-sm">{total}%</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {isExact100
                  ? 'Total valid (tepat 100%). Seluruh nilai akan dihitung ulang secara otomatis.'
                  : 'Total bobot TIDAK sama dengan 100%. Perubahan tidak dapat disimpan.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!isExact100}
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isExact100
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Terapkan Bobot
          </button>
        </div>

        {savedFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
            <span>Bobot berhasil disimpan. Nilai rekapitulasi telah diperbarui!</span>
            <button
              onClick={onNavigateToRecap}
              className="text-emerald-900 font-bold underline flex items-center gap-1"
            >
              <span>Lihat Rekapitulasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

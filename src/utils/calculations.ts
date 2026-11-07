import {
  CriteriaWeights,
  JudgeEvaluation,
  Participant,
  Judge,
  CompanyEvaluationResult,
} from '../types/scoring';

export const DEFAULT_WEIGHTS: CriteriaWeights = {
  strategi: 40,
  implementasi: 35,
  hasil: 25,
};

export const ALTERNATE_TEST_WEIGHTS: CriteriaWeights = {
  strategi: 50,
  implementasi: 30,
  hasil: 20,
};

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'S01',
    companyName: 'PT Sinergi Optima Prima',
    innovationTitle: 'Sistem Otomasi Logistik Cerdas Berbasis IoT & AI',
    category: 'Supply Chain & Operational Excellence',
    leadPresenter: 'Budi Santoso, ST',
  },
  {
    id: 'S02',
    companyName: 'PT Solusi Nusantara Digital',
    innovationTitle: 'Platform Prediktif Pemeliharaan Aset Industri Terintegrasi',
    category: 'Digital Transformation & Industry 4.0',
    leadPresenter: 'Dra. Rina Kusuma',
  },
  {
    id: 'S03',
    companyName: 'PT Sukses Mandiri Integra',
    innovationTitle: 'Arsitektur Enterprise Analytics Real-Time & ESG Tracker',
    category: 'Sustainable Business Innovation',
    leadPresenter: 'Ahmad Fauzi, M.Kom',
  },
];

export const INITIAL_JUDGES: Judge[] = [
  {
    id: 'J1',
    name: 'Dr. Hendra Prasetya, M.Sc',
    title: 'Lead Technology Assessor',
    institution: 'Komite Riset & Evaluasi Teknologi MSI Group',
    avatarBg: 'bg-indigo-600',
  },
  {
    id: 'J2',
    name: 'Ir. Maya Anggraeni, MBA',
    title: 'Principal Business Strategy Assessor',
    institution: 'Direktorat Transformasi Bisnis MSI Group',
    avatarBg: 'bg-emerald-600',
  },
];

export const INITIAL_EVALUATIONS: JudgeEvaluation[] = [
  // S01
  {
    judgeId: 'J1',
    participantId: 'S01',
    strategi: 4,
    implementasi: 3,
    hasil: 4,
    notes: 'Strategi implementasi matang, eksekusi lapangan perlu percepatan skalabilitas.',
    lastUpdated: '2026-11-06T09:15:00',
  },
  {
    judgeId: 'J2',
    participantId: 'S01',
    strategi: 4,
    implementasi: 4,
    hasil: 3,
    notes: 'Dukungan implementasi organisasi sangat solid, metrik dampak akhir masih dapat ditingkatkan.',
    lastUpdated: '2026-11-06T10:20:00',
  },
  // S02
  {
    judgeId: 'J1',
    participantId: 'S02',
    strategi: 3,
    implementasi: 4,
    hasil: 4,
    notes: 'Arsitektur sistem andal dan modular, namun diferensiasi roadmap strategi masih generik.',
    lastUpdated: '2026-11-06T11:05:00',
  },
  {
    judgeId: 'J2',
    participantId: 'S02',
    strategi: 4,
    implementasi: 3,
    hasil: 4,
    notes: 'Kajian strategi bisnis komprehensif, implementasi membutuhkan automasi mitigasi risiko tambahan.',
    lastUpdated: '2026-11-06T11:45:00',
  },
  // S03
  {
    judgeId: 'J1',
    participantId: 'S03',
    strategi: 5,
    implementasi: 4,
    hasil: 3,
    notes: 'Visi strategi sangat luar biasa dan terdepan. Adopsi sistem berjalan sangat lancar.',
    lastUpdated: '2026-11-06T13:10:00',
  },
  {
    judgeId: 'J2',
    participantId: 'S03',
    strategi: 4,
    implementasi: 4,
    hasil: 4,
    notes: 'Keseimbangan prima antara perencanaan strategis, eksekusi operasional, dan kepuasan pengguna.',
    lastUpdated: '2026-11-06T14:00:00',
  },
];

/**
 * Validasi rentang skor [0, 5].
 * Mengembalikan objek validasi dengan pesan error jika tidak valid.
 */
export function validateScore(val: number | null | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (val === null || val === undefined || isNaN(val)) {
    return { isValid: false, error: 'Skor belum diisi' };
  }
  if (val < 0 || val > 5) {
    return {
      isValid: false,
      error: `Skor ${val} ditolak! Nilai harus berada dalam rentang 0 s/d 5.`,
    };
  }
  return { isValid: true };
}

/** Parse isian skor dari input teks (menerima koma desimal). Kosong = belum diisi (bukan error). */
export function parseScoreInput(raw: string): { value: number | null; error?: string } {
  const t = raw.trim().replace(',', '.');
  if (t === '') return { value: null };
  const n = Number(t);
  if (!Number.isFinite(n)) return { value: null, error: 'Harus berupa angka' };
  const v = validateScore(n);
  return v.isValid ? { value: n } : { value: null, error: v.error };
}

/**
 * Validasi total bobot kriteria harus tepat 100%.
 */
export function validateWeights(weights: CriteriaWeights): {
  isValid: boolean;
  total: number;
  error?: string;
} {
  const values = [weights.strategi, weights.implementasi, weights.hasil].map(Number);
  const total = values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);

  if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) {
    return {
      isValid: false,
      total,
      error: 'Setiap bobot harus berupa angka 0 sampai 100.',
    };
  }

  if (Math.abs(total - 100) > 0.001) {
    return {
      isValid: false,
      total,
      error: `Total bobot harus tepat 100%. Saat ini: ${total}%. Perubahan ditolak.`,
    };
  }
  return { isValid: true, total };
}

/**
 * Menghitung nilai per juri berdasarkan rumus:
 * (skor strategi ÷ 5 × bobot_strategi) + (skor implementasi ÷ 5 × bobot_implementasi) + (skor hasil ÷ 5 × bobot_hasil)
 * Mengembalikan null jika ada kriteria yang belum terisi lengkap atau tidak valid.
 */
export function calculateJudgeScore(
  evalData: JudgeEvaluation | null | undefined,
  weights: CriteriaWeights
): number | null {
  if (!evalData) return null;

  const { strategi, implementasi, hasil } = evalData;

  // Pastikan semua kriteria memiliki nilai valid dalam rentang 0 - 5
  if (
    strategi === null ||
    strategi === undefined ||
    implementasi === null ||
    implementasi === undefined ||
    hasil === null ||
    hasil === undefined
  ) {
    return null;
  }

  if (
    strategi < 0 ||
    strategi > 5 ||
    implementasi < 0 ||
    implementasi > 5 ||
    hasil < 0 ||
    hasil > 5
  ) {
    return null;
  }

  const partStrategi = (strategi / 5) * weights.strategi;
  const partImplementasi = (implementasi / 5) * weights.implementasi;
  const partHasil = (hasil / 5) * weights.hasil;

  // Tidak dibulatkan di sini agar rata-rata dua juri tidak mengalami
  // pembulatan ganda. Pembulatan 1 desimal hanya untuk nilai akhir & tampilan.
  return Math.round((partStrategi + partImplementasi + partHasil) * 1e6) / 1e6;
}

/**
 * Menghitung rekapitulasi penilaian perusahaan:
 * Rata-rata dari dua juri.
 * Jika salah satu juri belum mengisi lengkap, status 'Belum Lengkap', bukan 0 atau nilai cacat.
 */
export function compileCompanyResults(
  participants: Participant[],
  evaluations: JudgeEvaluation[],
  weights: CriteriaWeights
): CompanyEvaluationResult[] {
  const results: CompanyEvaluationResult[] = participants.map((participant) => {
    const j1Eval =
      evaluations.find(
        (e) => e.participantId === participant.id && e.judgeId === 'J1'
      ) || null;
    const j2Eval =
      evaluations.find(
        (e) => e.participantId === participant.id && e.judgeId === 'J2'
      ) || null;

    const j1Score = calculateJudgeScore(j1Eval, weights);
    const j2Score = calculateJudgeScore(j2Eval, weights);

    const hasJ1 = j1Score !== null;
    const hasJ2 = j2Score !== null;

    let finalScore: number | null = null;
    let status: 'Lengkap' | 'Belum Lengkap' | 'Dalam Proses' = 'Belum Lengkap';

    if (hasJ1 && hasJ2) {
      finalScore = round1((j1Score + j2Score) / 2);
      status = 'Lengkap';
    } else if (hasJ1 || hasJ2) {
      status = 'Dalam Proses';
    } else {
      status = 'Belum Lengkap';
    }

    return {
      participant,
      j1Evaluation: j1Eval,
      j2Evaluation: j2Eval,
      j1Score,
      j2Score,
      finalScore,
      status,
    };
  });

  // Peringkat kompetisi (1,2,2,4): peserta seri berbagi peringkat yang sama.
  // Hanya peserta berstatus Lengkap yang diberi peringkat. Urutan input dipertahankan.
  return results.map((res) => {
    if (res.finalScore === null) return res;
    const rank =
      1 + results.filter((o) => o.finalScore !== null && o.finalScore > res.finalScore!).length;
    return { ...res, rank };
  });
}

/** Pembulatan 1 desimal yang aman terhadap galat floating point (72,45 -> 72,5). */
export function round1(n: number): number {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

/** Kode peserta berikutnya (S01, S02, ...) berdasarkan angka terbesar yang ada, bukan jumlah peserta. */
export function nextParticipantId(participants: Participant[]): string {
  const max = participants.reduce((m, p) => {
    const n = parseInt(p.id.replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `S${String(max + 1).padStart(2, '0')}`;
}

/**
 * Format angka ke standar Indonesia (koma sebagai pemisah desimal, misal 73,0)
 */
export function formatScoreID(score: number | null | undefined): string {
  if (score === null || score === undefined) return '-';
  return round1(score).toFixed(1).replace('.', ',');
}

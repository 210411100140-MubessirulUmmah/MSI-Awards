export interface CriteriaWeights {
  strategi: number; // e.g. 40
  implementasi: number; // e.g. 35
  hasil: number; // e.g. 25
}

export interface CriterionScore {
  score: number | null; // 0 to 5
}

export interface JudgeEvaluation {
  judgeId: string; // 'J1' | 'J2'
  participantId: string; // 'S01' | 'S02' | 'S03'
  strategi: number | null;
  implementasi: number | null;
  hasil: number | null;
  notes?: string;
  lastUpdated?: string; // ISO 8601
}

export interface Participant {
  id: string; // 'S01', 'S02', 'S03'
  companyName: string;
  innovationTitle: string;
  category: string;
  leadPresenter: string;
}

export interface Judge {
  id: string; // 'J1', 'J2'
  name: string;
  title: string;
  institution: string;
  avatarBg: string;
}

export type UserRole = 'ADMIN' | 'J1' | 'J2';

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  title: string;
  institution: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface CompanyEvaluationResult {
  participant: Participant;
  j1Evaluation: JudgeEvaluation | null;
  j2Evaluation: JudgeEvaluation | null;
  j1Score: number | null;
  j2Score: number | null;
  finalScore: number | null;
  status: 'Lengkap' | 'Belum Lengkap' | 'Dalam Proses';
  rank?: number;
}

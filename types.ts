
export type DISCType = 'D' | 'I' | 'S' | 'C';

export const ALL_SCORES: readonly number[] = [4, 3, 2, 1];

export interface Scores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export type Answer = Partial<Scores>;

export type Answers = Record<number, Answer>;

export interface Question {
  category: string;
  options: Record<DISCType, string>;
}

export interface Profile {
  name: string;
}

export interface DISCDescription {
    title: string;
    points: string[];
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface TestResult {
  id?: string;
  email: string;
  name: string;
  scores: Scores;
  profileName: string;
  createdAt: any;
}

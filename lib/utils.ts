import type { Scores, DISCType } from '../types';
import { profiles } from '../constants';

export function getProfileName(scores: Scores): string {
  const sortedScores = (Object.keys(scores) as DISCType[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  const key3 = sortedScores.slice(0, 3).join('');
  const key2 = sortedScores.slice(0, 2).join('');
  const key1 = sortedScores[0];
  const foundProfile =
    profiles[key3] || profiles[key2] || profiles[key1] || { name: '결과를 찾을 수 없음' };
  return foundProfile.name;
}

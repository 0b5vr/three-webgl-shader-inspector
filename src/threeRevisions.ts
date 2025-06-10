export const threeRevisions = {
  'r170': '170',
  'r171': '171',
  'r172': '172',
  'r173': '173',
  'r174': '174',
  'r175': '175',
  'r176': '176',
  'r177': '177',
} as const;

export type ThreeRevision = keyof typeof threeRevisions;

export const DEFAULT_THREE_REVISION: ThreeRevision = 'r177';

export const threeRevisions = {
  'r169': '169',
  'r170': '170',
  'r171': '171',
  'r172': '172',
  'r173': '173',
  'r174': '174',
  'r175': '175',
  'r176': '176',
  'r177': '177',
  'r178': '178',
  'r179': '179',
  'r180': '180',
  'r181': '181',
  'r182': '182',
  'r183': '183',
  'r184': '184',
  'r185': '185',
} as const;

export type ThreeRevision = keyof typeof threeRevisions;

export const DEFAULT_THREE_REVISION: ThreeRevision = 'r185';

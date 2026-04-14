/**
 * Tooth numbering systems for dental imaging.
 * Supports FDI (international) and Universal (US) numbering.
 */

export type NumberingSystem = 'FDI' | 'Universal';

export interface ToothInfo {
  fdi: number;
  universal: number;
  name: string;
  quadrant: 'upper-right' | 'upper-left' | 'lower-left' | 'lower-right';
}

// FDI numbering: quadrant digit (1-4) + tooth digit (1-8)
// Universal numbering: 1-32 starting from upper-right third molar
const TEETH: ToothInfo[] = [
  // Upper Right (FDI quadrant 1, Universal 1-8)
  { fdi: 18, universal: 1, name: 'Third Molar', quadrant: 'upper-right' },
  { fdi: 17, universal: 2, name: 'Second Molar', quadrant: 'upper-right' },
  { fdi: 16, universal: 3, name: 'First Molar', quadrant: 'upper-right' },
  { fdi: 15, universal: 4, name: 'Second Premolar', quadrant: 'upper-right' },
  { fdi: 14, universal: 5, name: 'First Premolar', quadrant: 'upper-right' },
  { fdi: 13, universal: 6, name: 'Canine', quadrant: 'upper-right' },
  { fdi: 12, universal: 7, name: 'Lateral Incisor', quadrant: 'upper-right' },
  { fdi: 11, universal: 8, name: 'Central Incisor', quadrant: 'upper-right' },
  // Upper Left (FDI quadrant 2, Universal 9-16)
  { fdi: 21, universal: 9, name: 'Central Incisor', quadrant: 'upper-left' },
  { fdi: 22, universal: 10, name: 'Lateral Incisor', quadrant: 'upper-left' },
  { fdi: 23, universal: 11, name: 'Canine', quadrant: 'upper-left' },
  { fdi: 24, universal: 12, name: 'First Premolar', quadrant: 'upper-left' },
  { fdi: 25, universal: 13, name: 'Second Premolar', quadrant: 'upper-left' },
  { fdi: 26, universal: 14, name: 'First Molar', quadrant: 'upper-left' },
  { fdi: 27, universal: 15, name: 'Second Molar', quadrant: 'upper-left' },
  { fdi: 28, universal: 16, name: 'Third Molar', quadrant: 'upper-left' },
  // Lower Left (FDI quadrant 3, Universal 17-24)
  { fdi: 38, universal: 17, name: 'Third Molar', quadrant: 'lower-left' },
  { fdi: 37, universal: 18, name: 'Second Molar', quadrant: 'lower-left' },
  { fdi: 36, universal: 19, name: 'First Molar', quadrant: 'lower-left' },
  { fdi: 35, universal: 20, name: 'Second Premolar', quadrant: 'lower-left' },
  { fdi: 34, universal: 21, name: 'First Premolar', quadrant: 'lower-left' },
  { fdi: 33, universal: 22, name: 'Canine', quadrant: 'lower-left' },
  { fdi: 32, universal: 23, name: 'Lateral Incisor', quadrant: 'lower-left' },
  { fdi: 31, universal: 24, name: 'Central Incisor', quadrant: 'lower-left' },
  // Lower Right (FDI quadrant 4, Universal 25-32)
  { fdi: 41, universal: 25, name: 'Central Incisor', quadrant: 'lower-right' },
  { fdi: 42, universal: 26, name: 'Lateral Incisor', quadrant: 'lower-right' },
  { fdi: 43, universal: 27, name: 'Canine', quadrant: 'lower-right' },
  { fdi: 44, universal: 28, name: 'First Premolar', quadrant: 'lower-right' },
  { fdi: 45, universal: 29, name: 'Second Premolar', quadrant: 'lower-right' },
  { fdi: 46, universal: 30, name: 'First Molar', quadrant: 'lower-right' },
  { fdi: 47, universal: 31, name: 'Second Molar', quadrant: 'lower-right' },
  { fdi: 48, universal: 32, name: 'Third Molar', quadrant: 'lower-right' },
];

export function getAllTeeth(): ToothInfo[] {
  return TEETH;
}

export function getToothByFDI(fdi: number): ToothInfo | undefined {
  return TEETH.find(t => t.fdi === fdi);
}

export function getToothByUniversal(universal: number): ToothInfo | undefined {
  return TEETH.find(t => t.universal === universal);
}

export function getTeethByQuadrant(quadrant: ToothInfo['quadrant']): ToothInfo[] {
  return TEETH.filter(t => t.quadrant === quadrant);
}

export function getToothLabel(tooth: ToothInfo, system: NumberingSystem): string {
  return system === 'FDI' ? `${tooth.fdi}` : `${tooth.universal}`;
}

import type { ColourPlate } from '../types';

// Original fixed-seed experimental materials; not Ishihara plates and not a diagnostic test.
export const COLOUR_PLATES: ColourPlate[] = [
  { id: 'control-sun', kind: 'control', prompt: 'Enter the number you see.', expectedAnswer: '8', seed: 801, hueA: '#FDE68A', hueB: '#2563EB' },
  { id: 'control-leaf', kind: 'control', prompt: 'Enter the number you see.', expectedAnswer: '3', seed: 302, hueA: '#A7F3D0', hueB: '#7C3AED' },
  { id: 'explore-coral', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '5', seed: 519, hueA: '#FCA5A5', hueB: '#0F766E' },
  { id: 'explore-sky', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '2', seed: 204, hueA: '#93C5FD', hueB: '#B45309' },
  { id: 'explore-violet', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '7', seed: 704, hueA: '#C4B5FD', hueB: '#166534' },
  { id: 'explore-sand', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '4', seed: 407, hueA: '#FDE68A', hueB: '#BE123C' },
  { id: 'explore-mint', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '6', seed: 618, hueA: '#99F6E4', hueB: '#7C2D12' },
  { id: 'explore-rose', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '9', seed: 906, hueA: '#FDA4AF', hueB: '#1D4ED8' },
  { id: 'explore-lime', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '1', seed: 103, hueA: '#D9F99D', hueB: '#6D28D9' },
  { id: 'explore-peach', kind: 'experimental', prompt: 'Enter the number you see, or choose “Cannot identify”.', expectedAnswer: '0', seed: 12, hueA: '#FED7AA', hueB: '#0369A1' },
];

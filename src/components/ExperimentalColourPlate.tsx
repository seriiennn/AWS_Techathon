import { useMemo } from 'react';
import type { ColourPlate } from '../types';

interface ExperimentalColourPlateProps { plate: ColourPlate; }

const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

export const ExperimentalColourPlate = ({ plate }: ExperimentalColourPlateProps) => {
  const dots = useMemo(() => {
    const random = seeded(plate.seed);
    return Array.from({ length: 170 }, (_, index) => ({
      id: index,
      x: 8 + random() * 184,
      y: 8 + random() * 184,
      radius: 1.8 + random() * 3.1,
      accent: random() > .48,
    }));
  }, [plate]);
  return <svg aria-label="Original experimental colour-dot plate" className="colour-plate" role="img" viewBox="0 0 200 200">
    <defs><clipPath id={`plate-${plate.id}`}><circle cx="100" cy="100" r="94" /></clipPath></defs>
    <circle cx="100" cy="100" fill="#f8fafc" r="96" stroke="#e2e8f0" />
    <g clipPath={`url(#plate-${plate.id})`}>{dots.map((dot) => <circle cx={dot.x} cy={dot.y} fill={dot.accent ? plate.hueB : plate.hueA} key={dot.id} opacity={dot.accent ? .75 : .7} r={dot.radius} />)}
      <text dominantBaseline="middle" fill={plate.hueA} fontFamily="Arial, sans-serif" fontSize="100" fontWeight="700" textAnchor="middle" x="100" y="105">{plate.expectedAnswer}</text>
      {dots.filter((dot) => dot.accent).slice(0, 30).map((dot) => <circle cx={dot.x} cy={dot.y} fill={plate.hueB} key={`mask-${dot.id}`} r={dot.radius * .8} />)}
    </g>
  </svg>;
};

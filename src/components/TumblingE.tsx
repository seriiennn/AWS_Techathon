import type { Direction } from '../types';

interface TumblingEProps {
  direction: Direction;
  sizeCssPx: number;
  label?: string;
  muted?: boolean;
  animate?: boolean;
}

const rotation: Record<Direction, number> = { right: 0, down: 90, left: 180, up: 270 };

export const TumblingE = ({ direction, sizeCssPx, label = 'Tumbling E optotype', muted = false, animate = true }: TumblingEProps) => (
  <svg aria-label={label} className={muted ? 'tumbling-e is-muted' : 'tumbling-e'} height={sizeCssPx} role="img" style={{ height: `${sizeCssPx}px`, transition: animate ? 'width 200ms ease-out, height 200ms ease-out' : 'none' }} viewBox="0 0 5 5" width={sizeCssPx}>
    <path d="M0 0H5V1H1V2H4V3H1V4H5V5H0Z" fill="currentColor" transform={`rotate(${rotation[direction]} 2.5 2.5)`} />
  </svg>
);

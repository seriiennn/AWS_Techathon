import { CARD_WIDTH_MM } from '../lib/calibration';

interface ScreenCalibrationProps {
  rectangleWidthPx: number;
  onChange: (width: number) => void;
  onComplete: () => void;
}

export const ScreenCalibration = ({ rectangleWidthPx, onChange, onComplete }: ScreenCalibrationProps) => {
  const cardHeightPx = rectangleWidthPx * (53.98 / CARD_WIDTH_MM);
  const pixelsPerMm = rectangleWidthPx / CARD_WIDTH_MM;

  return (
    <section className="calibration-card" aria-labelledby="screen-calibration-heading">
      <div className="eyebrow">Step 1 of 2 · Physical display calibration</div>
      <h2 id="screen-calibration-heading">Match a real payment card</h2>
      <p>Hold a standard ISO/IEC 7810 ID-1 card against this rectangle. Adjust until the displayed width precisely matches your physical card.</p>
      <div className="card-alignment-stage">
        <div className="reference-card" style={{ width: rectangleWidthPx, height: cardHeightPx }}>
          <span>85.60 mm</span><span>Reference card</span>
        </div>
      </div>
      <label className="range-label" htmlFor="card-width">Displayed card width <strong>{Math.round(rectangleWidthPx)} CSS px</strong></label>
      <input id="card-width" max="760" min="220" onChange={(event) => onChange(Number(event.target.value))} step="1" type="range" value={rectangleWidthPx} />
      <div className="calibration-footer">
        <span>Calculated scale: <strong>{pixelsPerMm.toFixed(3)} CSS px / mm</strong></span>
        <button className="button button-primary" onClick={onComplete} type="button">This matches my card</button>
      </div>
      <p className="fine-print">Do this at 100% browser zoom. Recalibrate after changing displays, OS display scale, browser zoom, or using a projector.</p>
    </section>
  );
};

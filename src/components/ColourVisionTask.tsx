import { useState } from 'react';
import { COLOUR_PLATES } from '../data/colourPlates';
import type { ColourResponse, ColourResult } from '../types';
import { ExperimentalColourPlate } from './ExperimentalColourPlate';

export const ColourVisionTask = ({ onComplete, onSkip }: { onComplete: (result: ColourResult) => void; onSkip: () => void; }) => {
  const [conditionsConfirmed, setConditionsConfirmed] = useState(false);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [responses, setResponses] = useState<ColourResponse[]>([]);
  const plate = COLOUR_PLATES[index];
  const submit = (uncertain = false) => {
    if (!conditionsConfirmed) return;
    const answer = uncertain ? '' : value.trim();
    const response: ColourResponse = { plateId: plate.id, answer, uncertain, correct: !uncertain && answer === plate.expectedAnswer };
    const next = [...responses, response];
    if (plate.kind === 'control' && !response.correct) {
      onComplete({ displayConditionsConfirmed: conditionsConfirmed, responses: next, controlsPassed: false, completed: false });
      return;
    }
    if (index === COLOUR_PLATES.length - 1) {
      onComplete({ displayConditionsConfirmed: conditionsConfirmed, responses: next, controlsPassed: true, completed: true });
      return;
    }
    setResponses(next); setIndex(index + 1); setValue('');
  };
  return <section className="colour-task"><div className="flow-heading"><div className="eyebrow">Optional · Experimental / Unvalidated</div><h1>Colour Vision Exploration</h1><p>These original fixed-seed dot plates are a short recognition experience—not a standard colour-vision examination.</p></div><div className="colour-layout"><div className="plate-panel"><ExperimentalColourPlate plate={plate} /></div><div className="colour-instructions"><span className="status-pill">Plate {index + 1} / {COLOUR_PLATES.length}</span><h2>{plate.kind === 'control' ? 'Practice / control plate' : 'Experimental plate'}</h2><p>{plate.prompt}</p><label className="check-label"><input checked={conditionsConfirmed} onChange={(event) => setConditionsConfirmed(event.target.checked)} type="checkbox" /> I have disabled Night Shift/colour filters where possible and checked glare/brightness.</label><input aria-label="Your answer" disabled={!conditionsConfirmed} inputMode="numeric" maxLength={1} onChange={(event) => setValue(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Enter one number" value={value} /><div className="hero-actions"><button className="button button-primary" disabled={!conditionsConfirmed || !value} onClick={() => submit(false)} type="button">Submit answer</button><button className="button button-secondary" disabled={!conditionsConfirmed} onClick={() => submit(true)} type="button">Cannot identify</button></div><button className="button button-link" onClick={onSkip} type="button">Skip colour exploration</button><p className="fine-print">Screen-size calibration is not colour calibration. If controls are difficult to identify, the app stops and suggests checking display conditions/task understanding; it makes no colour-vision conclusion.</p></div></div></section>;
};

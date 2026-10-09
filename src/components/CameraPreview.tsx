import type { RefObject } from 'react';
import type { TrackerReading } from '../types';

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement>;
  reading: TrackerReading;
  onRequest: () => void;
  onStop: () => void;
}

const statusLabel: Record<TrackerReading['status'], string> = {
  idle: 'Camera off', loading: 'Preparing', ready: 'Ready', 'no-face': 'No face', reposition: 'Reposition', moving: 'Hold steady', stable: 'Tracking', error: 'Unavailable',
};

export const CameraPreview = ({ videoRef, reading, onRequest, onStop }: CameraPreviewProps) => (
  <section className="camera-panel" aria-label="Camera tracking preview">
    <div className="panel-title-row"><div><div className="eyebrow">Browser-local processing</div><h2>Camera tracking</h2></div><span className={`status-pill status-${reading.status}`}>{statusLabel[reading.status]}</span></div>
    <div className="video-shell">
      <video autoPlay muted playsInline ref={videoRef} />
      <div className="video-overlay"><span className="scan-corner top-left" /><span className="scan-corner top-right" /><span className="scan-corner bottom-left" /><span className="scan-corner bottom-right" /><p>{reading.status === 'idle' || reading.status === 'error' ? 'Your camera preview will appear here.' : 'Keep both eyes within the guide.'}</p></div>
    </div>
    <p className="tracking-message">{reading.message}</p>
    <div className="camera-actions">
      <button className="button button-primary" onClick={onRequest} type="button">{reading.status === 'idle' || reading.status === 'error' ? 'Enable camera' : 'Restart camera'}</button>
      {reading.status !== 'idle' && <button className="button button-secondary" onClick={onStop} type="button">Turn off</button>}
    </div>
    <p className="fine-print">Face landmarks and video frames are processed in this browser and are never sent to this app’s server.</p>
  </section>
);

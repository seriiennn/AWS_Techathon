import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  calculateIpdFocalLengthPx,
  estimateDistanceFromIpd,
  estimateDistanceFromModel,
  median,
} from '../lib/calibration';
import { inspectFace, type Landmark } from '../lib/distance';
import type { CalibrationSample, DistanceModel, TrackerReading } from '../types';

interface TrackerConfig {
  model: DistanceModel | null;
  calibrationSamples: CalibrationSample[];
  ipdMm: number | null;
  useIpdAssist: boolean;
}

const initialReading: TrackerReading = {
  status: 'idle',
  message: 'Camera is off. Manual Demonstration Mode is always available.',
  eyePixelDistance: null,
  estimatedDistanceCm: null,
  rawDistanceCm: null,
  speedCmPerSecond: null,
  rollDegrees: null,
  yawAsymmetry: null,
};

const VISION_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const FACE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

export const useCameraTracker = (config: TrackerConfig) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const configRef = useRef(config);
  const lastInferenceRef = useRef(0);
  const previousRawRef = useRef<{ value: number; timestamp: number } | null>(null);
  const smoothedDistanceRef = useRef<number | null>(null);
  const [reading, setReading] = useState<TrackerReading>(initialReading);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const stopCamera = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    previousRawRef.current = null;
    smoothedDistanceRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setReading(initialReading);
  }, []);

  const requestCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setReading({ ...initialReading, status: 'error', message: 'This browser does not provide camera access. Use Manual Demonstration Mode.' });
      return;
    }

    stopCamera();
    setReading({ ...initialReading, status: 'loading', message: 'Requesting camera permission and loading on-device face tracking…' });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('Camera preview was not ready.');
      video.srcObject = stream;
      await video.play();

      const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
      });
      landmarkerRef.current = landmarker;
      setReading({ ...initialReading, status: 'ready', message: 'Camera ready. Center your face and look straight at the screen.' });

      const detect = (timestamp: number) => {
        const activeVideo = videoRef.current;
        const activeLandmarker = landmarkerRef.current;
        if (!activeVideo || !activeLandmarker || activeVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          animationRef.current = requestAnimationFrame(detect);
          return;
        }
        if (timestamp - lastInferenceRef.current >= 66) {
          lastInferenceRef.current = timestamp;
          const result = activeLandmarker.detectForVideo(activeVideo, timestamp);
          const observation = inspectFace(
            result.faceLandmarks[0] as Landmark[] | undefined,
            activeVideo.videoWidth,
            activeVideo.videoHeight,
          );

          if (!observation) {
            setReading({ ...initialReading, status: 'no-face', message: 'No face detected. Move into the camera frame with good lighting.' });
          } else if (!observation.usable) {
            setReading({
              status: 'reposition',
              message: observation.message,
              eyePixelDistance: observation.eyePixelDistance,
              estimatedDistanceCm: smoothedDistanceRef.current,
              rawDistanceCm: null,
              speedCmPerSecond: null,
              rollDegrees: observation.rollDegrees,
              yawAsymmetry: observation.yawAsymmetry,
            });
          } else {
            const activeConfig = configRef.current;
            const fromModel = activeConfig.model
              ? estimateDistanceFromModel(activeConfig.model, observation.eyePixelDistance)
              : null;
            const focalLength = activeConfig.ipdMm
              ? calculateIpdFocalLengthPx(activeConfig.calibrationSamples, activeConfig.ipdMm)
              : null;
            const fromIpd = activeConfig.useIpdAssist && activeConfig.ipdMm && focalLength
              ? estimateDistanceFromIpd(focalLength, activeConfig.ipdMm, observation.eyePixelDistance)
              : null;
            const rawDistance = fromModel && fromIpd
              ? fromModel * 0.7 + fromIpd * 0.3
              : fromModel ?? fromIpd;

            if (!rawDistance || rawDistance < 15 || rawDistance > 500) {
              setReading({
                status: 'stable',
                message: 'Face position is suitable. Complete distance calibration to estimate distance.',
                eyePixelDistance: observation.eyePixelDistance,
                estimatedDistanceCm: null,
                rawDistanceCm: null,
                speedCmPerSecond: null,
                rollDegrees: observation.rollDegrees,
                yawAsymmetry: observation.yawAsymmetry,
              });
            } else {
              const previous = previousRawRef.current;
              const speed = previous ? Math.abs(rawDistance - previous.value) / ((timestamp - previous.timestamp) / 1000) : 0;
              previousRawRef.current = { value: rawDistance, timestamp };
              if (speed > 28) {
                setReading({
                  status: 'moving',
                  message: 'Rapid movement detected. Hold still briefly to resume updates.',
                  eyePixelDistance: observation.eyePixelDistance,
                  estimatedDistanceCm: smoothedDistanceRef.current,
                  rawDistanceCm: rawDistance,
                  speedCmPerSecond: speed,
                  rollDegrees: observation.rollDegrees,
                  yawAsymmetry: observation.yawAsymmetry,
                });
              } else {
                const recent = [rawDistance, ...(previous ? [previous.value] : [])];
                const medianDistance = median(recent) ?? rawDistance;
                const current = smoothedDistanceRef.current;
                const smoothed = current === null ? medianDistance : current + 0.18 * (medianDistance - current);
                smoothedDistanceRef.current = smoothed;
                setReading({
                  status: 'stable',
                  message: activeConfig.useIpdAssist ? 'Stable tracking with optional IPD assistance.' : 'Stable tracking with multi-point calibration.',
                  eyePixelDistance: observation.eyePixelDistance,
                  estimatedDistanceCm: smoothed,
                  rawDistanceCm: rawDistance,
                  speedCmPerSecond: speed,
                  rollDegrees: observation.rollDegrees,
                  yawAsymmetry: observation.yawAsymmetry,
                });
              }
            }
          }
        }
        animationRef.current = requestAnimationFrame(detect);
      };
      animationRef.current = requestAnimationFrame(detect);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown camera error';
      stopCamera();
      setReading({ ...initialReading, status: 'error', message: `Camera could not start: ${detail}. Use Manual Demonstration Mode instead.` });
    }
  }, [stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return { videoRef, reading, requestCamera, stopCamera };
};

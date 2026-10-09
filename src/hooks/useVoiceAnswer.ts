import { useCallback, useEffect, useRef, useState } from 'react';
import type { TrialAnswer } from '../types';

const answerFromTranscript = (raw: string): TrialAnswer | null => {
  const value = raw.toLowerCase().replace(/[\s，,。.!！?？]/g, '');
  if (/看不清|看不到|不清楚|不知道|无法辨认|cannotidentify|unsure|idon'tknow/.test(value)) return 'unsure';
  if (/上面|向上|上|up/.test(value)) return 'up';
  if (/下面|向下|下|down/.test(value)) return 'down';
  if (/左边|向左|左|left/.test(value)) return 'left';
  if (/右边|向右|右|right/.test(value)) return 'right';
  return null;
};

const messageForError = (error: string) => ({
  'not-allowed': '麦克风权限被拒绝。你仍可点击按钮或使用键盘方向键。',
  'service-not-allowed': '浏览器未允许语音识别服务。请使用按钮或键盘。',
  'no-speech': '未听到清晰语音，请再试一次或使用按钮。',
  network: '语音识别服务连接失败，请使用按钮或键盘。',
  aborted: '语音识别已停止。',
}[error] ?? '语音识别暂时不可用，请使用按钮或键盘。');

export const useVoiceAnswer = (onAnswer: (answer: TrialAnswer) => void) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onAnswerRef = useRef(onAnswer);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);
  const stop = useCallback(() => { recognitionRef.current?.stop(); }, []);
  const start = useCallback(() => {
    if (!isSupported || isListening) return;
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;
    setError(null); setTranscript('');
    const recognition = new Constructor();
    recognition.lang = 'zh-HK';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const text = result[0]?.transcript.trim() ?? '';
      setTranscript(text);
      if (result.isFinal) {
        const answer = answerFromTranscript(text);
        if (answer) onAnswerRef.current(answer);
        else setError('未识别为“上、下、左、右”或“看不清”。请再试一次，或使用按钮。');
        recognition.stop();
      }
    };
    recognition.onerror = (event) => { setError(messageForError(event.error)); };
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    try { recognition.start(); setIsListening(true); } catch { setError('语音识别无法启动，请使用按钮或键盘。'); setIsListening(false); }
  }, [isListening, isSupported]);

  useEffect(() => () => recognitionRef.current?.abort(), []);
  return { isSupported, isListening, transcript, error, start, stop };
};

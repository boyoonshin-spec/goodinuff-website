"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionResultLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  ariaLabel?: string;
};

export default function VoiceField({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
  className = "",
  ariaLabel,
}: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const w = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      transcript = transcript.trim();
      if (!transcript) return;
      const current = valueRef.current;
      onChangeRef.current(current ? `${current} ${transcript}` : transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  }

  const fieldClassName = `field ${multiline ? "resize-none" : ""} pr-11 ${className}`;

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          aria-label={ariaLabel}
          className={fieldClassName}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={fieldClassName}
        />
      )}
      {supported && (
        <button
          type="button"
          onClick={toggleListening}
          title={listening ? "음성 입력 중지" : "음성으로 입력"}
          aria-pressed={listening}
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            listening
              ? "bg-[var(--danger)] text-white animate-pulse"
              : "bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-80"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
            <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

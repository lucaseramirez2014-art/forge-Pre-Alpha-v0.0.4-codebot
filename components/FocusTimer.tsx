"use client";

import { useEffect, useRef, useState } from "react";

type FocusTimerProps = {
  minutes: number;
  xpReward: number;
  onFinish: (elapsedSeconds: number, completionRatio: number) => void;
};

export function FocusTimer({ minutes, xpReward, onFinish }: FocusTimerProps) {
  const initialSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const finished = useRef(false);
  const elapsed = Math.max(0, initialSeconds - secondsLeft);
  const progress = Math.min(1, elapsed / initialSeconds);
  const pendingXP = Math.max(1, Math.round(xpReward * progress));

  function finish(isEarly: boolean) {
    if (finished.current) return;
    finished.current = true;
    setHasFinished(true);
    setRunning(false);
    const ratio = isEarly ? progress : 1;
    onFinish(isEarly ? elapsed : initialSeconds, ratio);
  }

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) finish(false);
  // finish is intentionally omitted to avoid recreating the completion interval.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const display = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return <div className="text-center"><div className="relative mx-auto grid size-60 place-items-center rounded-full sm:size-72" style={{ background: `conic-gradient(#fb923c ${progress * 360}deg, rgba(255,255,255,.07) ${progress * 360}deg)` }}><div className="grid size-[calc(100%-12px)] place-items-center rounded-full bg-[#11100f] shadow-inner shadow-black/80"><div><p className="font-mono text-5xl font-semibold tracking-tight text-white sm:text-6xl">{display}</p><p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">focus remaining</p><p className="mt-4 text-sm font-semibold text-orange-300">{pendingXP} XP pending</p></div></div></div><div className="mt-8 flex flex-wrap justify-center gap-3"><button disabled={secondsLeft === 0 || hasFinished} onClick={() => setRunning((value) => !value)} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60">{running ? "Pause" : "Resume focus"}</button><button disabled={!elapsed || hasFinished} onClick={() => finish(true)} className="rounded-xl border border-white/12 px-5 py-3 text-sm font-medium text-stone-300 transition hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-40">End early</button></div><p className="mt-4 text-xs text-stone-500">Ending early banks XP in proportion to completed focus time.</p></div>;
}

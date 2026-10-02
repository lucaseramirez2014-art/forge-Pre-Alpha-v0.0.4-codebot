"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useForge } from "./ForgeProvider";

export function ProgressControls() {
  const { exportData, importData, resetProgress } = useForge();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function downloadBackup() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "forge-v0-0-4-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  }

  function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const restored = typeof reader.result === "string" && importData(reader.result);
      setMessage(restored ? "Backup restored." : "That file is not a valid FORGE backup.");
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <details className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <summary className="cursor-pointer list-none text-sm font-semibold text-stone-200">Local beta controls <span className="ml-2 text-xs font-normal text-stone-500">backup, restore, or reset</span></summary>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={downloadBackup} className="rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-stone-300 transition hover:bg-white/6">Export backup</button>
        <button onClick={() => inputRef.current?.click()} className="rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-stone-300 transition hover:bg-white/6">Import backup</button>
        <button onClick={() => { if (window.confirm("Reset all local FORGE progress to the starter campaign?")) { resetProgress(); setMessage("Starter campaign restored."); } }} className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/8">Reset demo</button>
        <input ref={inputRef} type="file" accept="application/json" onChange={restoreBackup} className="hidden" />
      </div>
      {message && <p className="mt-3 text-xs text-stone-500" aria-live="polite">{message}</p>}
    </details>
  );
}

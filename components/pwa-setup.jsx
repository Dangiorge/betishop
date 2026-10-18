"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PwaSetup() {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const captureInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const clearInstallPrompt = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", clearInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", clearInstallPrompt);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  if (!installPrompt) return null;

  return (
    <aside className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:inset-x-auto sm:bottom-5 sm:right-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-950 text-white">
        <Download size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Install BetiShop</p>
        <p className="text-xs text-slate-500">Add it to your device for quick access.</p>
      </div>
      <button
        type="button"
        onClick={installApp}
        className="min-h-10 rounded-lg bg-blue-950 px-3 text-sm font-semibold text-white hover:bg-blue-900"
      >
        Install
      </button>
      <button
        type="button"
        aria-label="Dismiss install prompt"
        onClick={() => setInstallPrompt(null)}
        className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}

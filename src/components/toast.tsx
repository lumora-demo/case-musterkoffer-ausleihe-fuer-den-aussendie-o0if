"use client";

import { Check } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { de } from "@/content/de";

// Meldung nach einer Aktion: bestätigt genau das Getane, optional mit „Rückgängig“ (statt Rückfrage).
// Erscheint unten (am Handy über der Leiste), verschwindet nach 6 s. Vorgelesen per aria-live.
type Meldung = { id: number; text: string; rueckgaengig?: () => void };

let aktuell: Meldung | null = null;
const hoerer = new Set<() => void>();
const melde = () => hoerer.forEach((h) => h());

export function zeigeMeldung(text: string, rueckgaengig?: () => void) {
  aktuell = { id: Date.now(), text, rueckgaengig };
  melde();
}

function schliesse() {
  aktuell = null;
  melde();
}

export function Toaster() {
  const m = useSyncExternalStore(
    (f) => {
      hoerer.add(f);
      return () => hoerer.delete(f);
    },
    () => aktuell,
    () => null,
  );

  useEffect(() => {
    if (!m) return;
    const t = window.setTimeout(schliesse, 6000);
    return () => window.clearTimeout(t);
  }, [m]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 sm:bottom-6">
      {m ? (
        <div key={m.id} className="animate-enter pointer-events-auto flex max-w-[520px] items-center gap-3 rounded-pop bg-tile py-2 pr-2 pl-4 text-control text-tile-text shadow-pop">
          <Check className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="min-w-0 flex-1">{m.text}</span>
          {m.rueckgaengig ? (
            <button
              type="button"
              onClick={() => {
                m.rueckgaengig?.();
                schliesse();
              }}
              className="relative min-h-9 shrink-0 rounded-btn px-3 font-semibold text-tile-text hover:bg-fill-2 pointer-coarse:min-h-11"
            >
              {de.allgemein.rueckgaengig}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

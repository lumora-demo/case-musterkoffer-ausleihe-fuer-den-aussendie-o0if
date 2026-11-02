"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { de } from "@/content/de";
import { cn } from "@/lib/utils";

// Dialog für Formulare (520 px) und Rückfragen (420 px). Rechner: Mitte. Handy: Fenster von unten.
// Nutzt das native <dialog>: Esc schließt, Fokus bleibt im Dialog. Sichtbarer X-Knopf für das Handy.
export function Dialog({
  offen,
  schliessen,
  titel,
  breite = "formular",
  children,
}: {
  offen: boolean;
  schliessen: () => void;
  titel: string;
  breite?: "formular" | "rueckfrage";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    if (!offen && d.open) d.close();
  }, [offen]);

  return (
    <dialog
      ref={ref}
      aria-label={titel}
      onClose={schliessen}
      onClick={(e) => e.target === ref.current && schliessen()}
      className={cn(
        "w-full rounded-card bg-surface p-0 text-text shadow-pop backdrop:bg-(--scrim) open:animate-enter",
        breite === "formular" ? "sm:max-w-[520px]" : "sm:max-w-[420px]",
        "max-sm:mx-0 max-sm:mt-auto max-sm:mb-0 max-sm:max-h-[90dvh] max-sm:max-w-none max-sm:rounded-b-none",
      )}
    >
      <div className="flex flex-col gap-4 p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-h3 font-semibold">{titel}</h2>
          <button
            type="button"
            onClick={schliessen}
            aria-label={de.allgemein.schliessen}
            title={de.allgemein.schliessen}
            className="touch-target relative -mr-2 flex size-9 items-center justify-center rounded-control text-text-2 hover:bg-fill hover:text-text"
          >
            <X className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Eigene Schriftgrößen und Rundungen aus globals.css bekannt machen, sonst hält twMerge
// z. B. „text-control“ für eine Farbe und wirft „text-on-accent“ weg.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "body", "control", "small", "caption"],
      radius: ["btn", "control", "card", "tile", "pop"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Datum aus ISO (JJJJ-MM-TT) als TT.MM.JJJJ, ohne Zeitzonen-Verschiebung
export function datum(iso: string) {
  const [j, m, t] = iso.split("-");
  return `${t}.${m}.${j}`;
}

// Kurzform TT.MM. für Zeiträume
export function datumKurz(iso: string) {
  const [, m, t] = iso.split("-");
  return `${t}.${m}.`;
}

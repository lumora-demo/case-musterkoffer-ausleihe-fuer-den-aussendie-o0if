"use client";

import { useSyncExternalStore } from "react";
import {
  HEUTE,
  ICH,
  KOFFER,
  MELDUNGEN,
  PERSONEN,
  RESERVIERUNGEN,
  type Koffer,
  type Meldung,
  type MeldungArt,
  type Reservierung,
} from "./demo-daten";

// Fachlogik der Musterkoffer-Ausleihe. In der Vorschau liegt der Zustand im Browser (localStorage),
// im Zielbild übernimmt das die API in backend/app/main.py mit denselben Feldern.

export interface Zustand {
  reservierungen: Reservierung[];
  meldungen: Meldung[];
}

const SCHLUESSEL = "lumora-musterkoffer-v1";
const START: Zustand = { reservierungen: RESERVIERUNGEN, meldungen: MELDUNGEN };

let zustand: Zustand = START;
let geladen = false;
const hoerer = new Set<() => void>();

function lade() {
  if (geladen || typeof window === "undefined") return;
  geladen = true;
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL);
    if (roh) zustand = JSON.parse(roh) as Zustand;
  } catch {
    zustand = START;
  }
}

function abonniere(f: () => void) {
  hoerer.add(f);
  return () => hoerer.delete(f);
}

export function useAusleihe(): Zustand {
  return useSyncExternalStore(
    abonniere,
    () => {
      lade();
      return zustand;
    },
    () => START,
  );
}

export function aendere(f: (z: Zustand) => Zustand) {
  lade();
  zustand = f(zustand);
  try {
    window.localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand));
  } catch {
    // Speicher voll oder gesperrt: Zustand gilt bis zum Neuladen.
  }
  hoerer.forEach((h) => h());
}

export function zuruecksetzen() {
  aendere(() => START);
}

// ---- Abfragen ----

export const person = (id: string) => PERSONEN.find((p) => p.id === id);
export const koffer = (id: string) => KOFFER.find((k) => k.id === id);

export type KofferStatus = "verfuegbar" | "unterwegs" | "ueberfaellig" | "pruefung";

export function aktiveAusleihe(z: Zustand, kofferId: string) {
  return z.reservierungen.find((r) => r.kofferId === kofferId && r.status === "aktiv");
}

export function naechsteReservierung(z: Zustand, kofferId: string) {
  return z.reservierungen
    .filter((r) => r.kofferId === kofferId && r.status === "geplant")
    .sort((a, b) => a.von.localeCompare(b.von))[0];
}

export function istUeberfaellig(r: Reservierung) {
  return r.status === "aktiv" && r.bis < HEUTE;
}

export function kofferStatus(z: Zustand, k: Koffer): KofferStatus {
  const a = aktiveAusleihe(z, k.id);
  if (a) return istUeberfaellig(a) ? "ueberfaellig" : "unterwegs";
  if (k.inPruefung) return "pruefung";
  return "verfuegbar";
}

export function offeneMeldung(z: Zustand, musterId: string) {
  return z.meldungen.find((m) => m.musterId === musterId && m.status === "offen");
}

// Belegt eine Reservierung den Zeitraum? Laufende Ausleihen belegen bis zur Rückgabe, mindestens bis heute.
function belegt(r: Reservierung): [string, string] | null {
  if (r.status === "zurueck") return null;
  if (r.status === "aktiv") return [r.von, r.bis < HEUTE ? HEUTE : r.bis];
  return [r.von, r.bis];
}

export function konflikt(z: Zustand, kofferId: string, von: string, bis: string) {
  return z.reservierungen.find((r) => {
    if (r.kofferId !== kofferId) return false;
    const b = belegt(r);
    return b !== null && von <= b[1] && bis >= b[0];
  });
}

export function plusTage(iso: string, tage: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

// Erster freier Zeitraum ab heute (Vorschlag im Formular)
export function freierZeitraum(z: Zustand, kofferId: string, dauer = 4): [string, string] {
  let von = HEUTE;
  for (let i = 0; i < 20; i++) {
    const k = konflikt(z, kofferId, von, plusTage(von, dauer));
    if (!k) break;
    von = plusTage(belegt(k)![1], 1);
  }
  return [von, plusTage(von, dauer)];
}

// ---- Aktionen ----

const neueId = (vorsilbe: string) => `${vorsilbe}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function reservieren(kofferId: string, von: string, bis: string, zweck: string): Reservierung {
  const r: Reservierung = { id: neueId("r"), kofferId, personId: ICH, von, bis, zweck, status: "geplant" };
  aendere((z) => ({ ...z, reservierungen: [...z.reservierungen, r] }));
  return r;
}

export function setzeReservierung(id: string, teil: Partial<Reservierung>) {
  aendere((z) => ({ ...z, reservierungen: z.reservierungen.map((r) => (r.id === id ? { ...r, ...teil } : r)) }));
}

export function entferneReservierung(id: string) {
  aendere((z) => ({ ...z, reservierungen: z.reservierungen.filter((r) => r.id !== id) }));
}

export function stelleWiederHer(r: Reservierung) {
  aendere((z) => ({ ...z, reservierungen: [...z.reservierungen.filter((x) => x.id !== r.id), r] }));
}

export function melden(kofferId: string, musterId: string, art: MeldungArt): Meldung {
  const m: Meldung = { id: neueId("m"), kofferId, musterId, art, personId: ICH, datum: HEUTE, status: "offen" };
  aendere((z) => ({ ...z, meldungen: [m, ...z.meldungen] }));
  return m;
}

export function entferneMeldung(id: string) {
  aendere((z) => ({ ...z, meldungen: z.meldungen.filter((m) => m.id !== id) }));
}

export function setzeMeldung(id: string, teil: Partial<Meldung>) {
  aendere((z) => ({ ...z, meldungen: z.meldungen.map((m) => (m.id === id ? { ...m, ...teil } : m)) }));
}

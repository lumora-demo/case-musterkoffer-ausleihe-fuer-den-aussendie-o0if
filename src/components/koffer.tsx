"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Dialog, Field, Input, KategoriePunkt, zeigeMeldung } from "@/components/ui";
import { de } from "@/content/de";
import {
  aktiveAusleihe,
  entferneReservierung,
  freierZeitraum,
  istUeberfaellig,
  koffer as findeKoffer,
  konflikt,
  naechsteReservierung,
  person,
  reservieren,
  setzeReservierung,
  stelleWiederHer,
  type KofferStatus,
  type Zustand,
} from "@/lib/ausleihe";
import { HEUTE, ICH, type Kategorie, type Koffer, type Reservierung } from "@/lib/demo-daten";
import { datum, datumKurz } from "@/lib/utils";

// Fachliche Bausteine der Musterkoffer-Ausleihe, zusammengesetzt aus ui.tsx.

const FARBE: Record<Kategorie, 1 | 2 | 3 | 4> = { profile: 1, beschlaege: 2, fassade: 3, tueren: 4 };
const TON: Record<KofferStatus, "ok" | "accent" | "danger" | "warn"> = { verfuegbar: "ok", unterwegs: "accent", ueberfaellig: "danger", pruefung: "warn" };

export function KategorieLabel({ k }: { k: Kategorie }) {
  return <KategoriePunkt farbe={FARBE[k]}>{de.kategorie[k]}</KategoriePunkt>;
}

export function StatusBadge({ status }: { status: KofferStatus }) {
  return <Badge ton={TON[status]}>{de.status[status]}</Badge>;
}

// Wo ist der Koffer? Bei einer Person (mit Rückgabe) oder im Heimatlager.
export function standort(z: Zustand, k: Koffer): { ort: string; zusatz?: string } {
  const a = aktiveAusleihe(z, k.id);
  if (a) {
    const p = person(a.personId);
    const ort = a.personId === ICH ? de.ort.beiDir : de.ort.bei(p?.name ?? "", p?.gebiet ?? "");
    return { ort, zusatz: istUeberfaellig(a) ? de.ort.seit(datum(a.bis)) : de.ort.bis(datum(a.bis)) };
  }
  const n = naechsteReservierung(z, k.id);
  if (n) {
    const p = person(n.personId);
    return { ort: k.lagerort, zusatz: de.ort.reserviertAb(datum(n.von), n.personId === ICH ? de.allgemein.du : (p?.name ?? "")) };
  }
  return { ort: k.lagerort };
}

// ---- Ausleihe als Zeile (Rechner) bzw. kompakte Karte (Handy) ----

const t = de.ausleihen;

export function ausleiheStatus(r: Reservierung): { text: string; ton: "accent" | "danger" | "neutral" | "ok" } {
  if (r.status === "zurueck") return { text: t.statusZurueck, ton: "ok" };
  if (r.status === "geplant") return { text: t.statusGeplant, ton: "neutral" };
  return istUeberfaellig(r) ? { text: t.statusUeberfaellig, ton: "danger" } : { text: t.statusUnterwegs, ton: "accent" };
}

export function AusleiheAktionen({ r }: { r: Reservierung }) {
  if (r.personId !== ICH || r.status === "zurueck") return null;
  const k = findeKoffer(r.kofferId);
  const nr = k?.nummer ?? "";
  if (r.status === "aktiv") {
    return (
      <Button
        groesse="s"
        onClick={() => {
          setzeReservierung(r.id, { status: "zurueck", zurueckAm: HEUTE });
          zeigeMeldung(t.zurueckgegeben(nr), () => setzeReservierung(r.id, { status: "aktiv", zurueckAm: undefined }));
        }}
      >
        {t.zurueckgeben}
      </Button>
    );
  }
  return (
    <div className="flex gap-2">
      {r.von <= HEUTE ? (
        <Button
          groesse="s"
          onClick={() => {
            setzeReservierung(r.id, { status: "aktiv" });
            zeigeMeldung(t.abgeholt(nr), () => setzeReservierung(r.id, { status: "geplant" }));
          }}
        >
          {t.abholen}
        </Button>
      ) : null}
      <Button
        groesse="s"
        variante="ghost"
        onClick={() => {
          entferneReservierung(r.id);
          zeigeMeldung(t.storniert(nr), () => stelleWiederHer(r));
        }}
      >
        {t.stornieren}
      </Button>
    </div>
  );
}

export function AusleiheListe({ liste, mitKoffer = true }: { liste: Reservierung[]; mitKoffer?: boolean }) {
  return (
    <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
      {liste.map((r) => {
        const k = findeKoffer(r.kofferId);
        const p = person(r.personId);
        const s = ausleiheStatus(r);
        return (
          <li
            key={r.id}
            className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                {mitKoffer && k ? (
                  <Link href={`/koffer/${k.id}/`} className="min-w-0 font-medium hover:text-accent pointer-coarse:py-1">
                    <span className="font-mono text-small text-muted">{k.nummer}</span> {k.name}
                  </Link>
                ) : (
                  <span className="font-medium">{r.personId === ICH ? de.ort.beiDir : p?.name}</span>
                )}
                <span className="sm:hidden">
                  <Badge ton={s.ton}>{s.text}</Badge>
                </span>
              </div>
              <span className="text-small text-muted">
                {mitKoffer ? `${r.personId === ICH ? de.ort.beiDir : p?.name} · ` : ""}
                {r.zweck}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <span className="font-mono text-small text-text-2 tabular-nums">
                {de.allgemein.zeitraum(datumKurz(r.von), datum(r.bis))}
                {r.zurueckAm ? ` · ${t.zurueckAm(datumKurz(r.zurueckAm))}` : ""}
              </span>
              <span className="max-sm:hidden">
                <Badge ton={s.ton}>{s.text}</Badge>
              </span>
              <AusleiheAktionen r={r} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ---- Reservieren: Formular im Dialog ----

const f = de.formular;

export function ReservierenDialog({ z, k, offen, schliessen }: { z: Zustand; k: Koffer; offen: boolean; schliessen: () => void }) {
  return (
    <Dialog offen={offen} schliessen={schliessen} titel={f.titel(k.nummer)}>
      {/* Neu einhängen bei jedem Öffnen: Vorschlag passt dann zur aktuellen Belegung */}
      {offen ? <ReservierenFormular z={z} k={k} fertig={schliessen} /> : null}
    </Dialog>
  );
}

function ReservierenFormular({ z, k, fertig }: { z: Zustand; k: Koffer; fertig: () => void }) {
  const [vorschlagVon, vorschlagBis] = freierZeitraum(z, k.id);
  const [von, setVon] = useState(vorschlagVon);
  const [bis, setBis] = useState(vorschlagBis);
  const [zweck, setZweck] = useState("");
  const [fehler, setFehler] = useState<{ von?: string; bis?: string }>({});

  function pruefe(): { von?: string; bis?: string } {
    const e: { von?: string; bis?: string } = {};
    if (!von) e.von = f.fehlerLeer;
    else if (von < HEUTE) e.von = f.fehlerVergangen;
    if (!bis) e.bis = f.fehlerLeer;
    else if (von && bis < von) e.bis = f.fehlerReihenfolge;
    if (!e.von && !e.bis) {
      const c = konflikt(z, k.id, von, bis);
      if (c) {
        const p = person(c.personId);
        e.von = f.fehlerBelegt(datum(c.von), datum(c.bis < HEUTE ? HEUTE : c.bis), c.personId === ICH ? de.allgemein.du : (p?.name ?? ""));
      }
    }
    return e;
  }

  function absenden(ev: React.FormEvent) {
    ev.preventDefault();
    const e = pruefe();
    setFehler(e);
    if (e.von || e.bis) {
      document.getElementById(e.von ? "res-von" : "res-bis")?.focus();
      return;
    }
    const r = reservieren(k.id, von, bis, zweck.trim());
    fertig();
    zeigeMeldung(f.erfolg(k.nummer, datum(von)), () => entferneReservierung(r.id));
  }

  return (
    <form noValidate onSubmit={absenden} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.von} fehler={fehler.von} hinweis={von === vorschlagVon ? f.vorschlag : undefined}>
          <Input id="res-von" type="date" min={HEUTE} value={von} aria-invalid={!!fehler.von} onChange={(e) => setVon(e.target.value)} onBlur={() => setFehler(pruefe())} />
        </Field>
        <Field label={f.bis} fehler={fehler.bis}>
          <Input id="res-bis" type="date" min={von || HEUTE} value={bis} aria-invalid={!!fehler.bis} onChange={(e) => setBis(e.target.value)} onBlur={() => setFehler(pruefe())} />
        </Field>
      </div>
      <Field label={f.zweck} optional={f.optional} hinweis={f.zweckHinweis}>
        <Input value={zweck} maxLength={80} onChange={(e) => setZweck(e.target.value)} />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variante="outline" onClick={fertig}>
          {de.allgemein.abbrechen}
        </Button>
        <Button variante="primary" type="submit">
          {f.absenden}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { ArrowLeft, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AusleiheAktionen, AusleiheListe, KategorieLabel, ReservierenDialog, standort, StatusBadge } from "@/components/koffer";
import { Badge, Button, Card, Hinweis, PageHeader, Section, zeigeMeldung } from "@/components/ui";
import { de } from "@/content/de";
import { aktiveAusleihe, entferneMeldung, koffer, kofferStatus, melden, offeneMeldung, person, useAusleihe } from "@/lib/ausleihe";
import { ICH, type MeldungArt, type Muster } from "@/lib/demo-daten";
import { datum } from "@/lib/utils";

const t = de.detail;

export function KofferDetail({ id }: { id: string }) {
  const z = useAusleihe();
  const [dialog, setDialog] = useState(false);
  const k = koffer(id)!;
  const status = kofferStatus(z, k);
  const ort = standort(z, k);
  const aktiv = aktiveAusleihe(z, k.id);
  const meineAktiv = aktiv?.personId === ICH ? aktiv : undefined;
  const belegung = z.reservierungen.filter((r) => r.kofferId === k.id && r.status !== "zurueck").sort((a, b) => a.von.localeCompare(b.von));

  function meldeMuster(m: Muster, art: MeldungArt) {
    const neu = melden(k.id, m.id, art);
    zeigeMeldung(de.meldungen.gemeldet(m.bezeichnung, k.nummer), () => entferneMeldung(neu.id));
  }

  return (
    <>
      <Link href="/koffer/" className="-mb-6 inline-flex min-h-11 w-fit items-center gap-1 text-small font-medium text-accent hover:underline sm:-mb-4">
        <ArrowLeft className="size-4" aria-hidden />
        {t.zurueck}
      </Link>

      <PageHeader title={`${k.nummer} ${k.name}`}>
        {meineAktiv ? <AusleiheAktionen r={meineAktiv} /> : null}
        <Button variante="primary" icon={CalendarPlus} onClick={() => setDialog(true)} className="max-sm:hidden">
          {t.reservieren}
        </Button>
      </PageHeader>

      {/* Kopf: am Handy steht das Wichtigste (Name, Status, Standort) im ersten Bildschirm */}
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-mono text-small text-muted sm:hidden">{k.nummer}</span>
            <span className="text-h3 font-semibold sm:hidden">{k.name}</span>
            <KategorieLabel k={k.kategorie} />
          </div>
          <StatusBadge status={status} />
        </div>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-small text-muted">{t.standort}</dt>
            <dd className="font-medium">{ort.ort}</dd>
            {ort.zusatz ? <dd className="text-small text-text-2">{ort.zusatz}</dd> : null}
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-small text-muted">{t.lager}</dt>
            <dd>{k.lagerort}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-small text-muted">{t.geprueft}</dt>
            <dd className="font-mono tabular-nums">{datum(k.geprueftAm)}</dd>
          </div>
        </dl>
        <Button variante="primary" groesse="l" icon={CalendarPlus} onClick={() => setDialog(true)} className="sm:hidden">
          {t.reservieren}
        </Button>
      </Card>

      {status === "ueberfaellig" && aktiv ? (
        <Hinweis ton="warn" title={t.ueberfaelligTitel}>
          {t.ueberfaelligText(aktiv.personId === ICH ? de.allgemein.du : (person(aktiv.personId)?.name ?? ""), datum(aktiv.bis))}
        </Hinweis>
      ) : null}
      {k.inPruefung ? (
        <Hinweis ton="warn" title={t.pruefungTitel}>
          {t.pruefungText}
        </Hinweis>
      ) : null}

      <Section title={t.musterTitel}>
        <p className="-mt-1 max-w-[68ch] text-small text-text-2">{t.musterLead}</p>
        <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
          {k.muster.map((m) => {
            const offen = offeneMeldung(z, m.id);
            return (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{m.bezeichnung}</span>
                  <span className="font-mono text-small text-muted">{m.artikelnr}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {m.stand === "veraltet" && !offen ? <Badge ton="warn">{t.standVeraltet}</Badge> : null}
                  {offen ? (
                    <Badge ton="warn">{offen.art === "fehlt" ? t.gemeldetFehlt : t.gemeldetVeraltet}</Badge>
                  ) : (
                    <>
                      <Button groesse="s" aria-label={t.fehltLabel(m.bezeichnung)} onClick={() => meldeMuster(m, "fehlt")}>
                        {t.fehlt}
                      </Button>
                      <Button groesse="s" variante="ghost" aria-label={t.veraltetLabel(m.bezeichnung)} onClick={() => meldeMuster(m, "veraltet")}>
                        {t.veraltet}
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title={t.belegung}>
        {belegung.length ? <AusleiheListe liste={belegung} mitKoffer={false} /> : <p className="text-small text-muted">{t.belegungLeer}</p>}
      </Section>

      <ReservierenDialog z={z} k={k} offen={dialog} schliessen={() => setDialog(false)} />
    </>
  );
}

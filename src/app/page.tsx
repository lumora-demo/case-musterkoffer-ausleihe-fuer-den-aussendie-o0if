"use client";

import { ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { AusleiheListe, KategorieLabel, standort, StatusBadge } from "@/components/koffer";
import { ButtonLink, Card, EmptyState, Hinweis, Kennzahl, PageHeader, Section } from "@/components/ui";
import { de } from "@/content/de";
import { istUeberfaellig, kofferStatus, useAusleihe } from "@/lib/ausleihe";
import { HEUTE, ICH, KOFFER } from "@/lib/demo-daten";
import { datum } from "@/lib/utils";

const t = de.uebersicht;

function MehrLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-small font-medium text-accent hover:underline">
      {children} <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

export default function Uebersicht() {
  const z = useAusleihe();
  const status = KOFFER.map((k) => kofferStatus(z, k));
  const zahl = (s: string) => status.filter((x) => x === s).length;
  const offeneMeldungen = z.meldungen.filter((m) => m.status === "offen").length;
  const meine = z.reservierungen.filter((r) => r.personId === ICH && r.status !== "zurueck").sort((a, b) => a.von.localeCompare(b.von));
  const ueberfaellig = z.reservierungen.filter(istUeberfaellig);
  const stichtag = de.allgemein.stichtag(datum(HEUTE));

  return (
    <>
      <PageHeader title={t.title} lead={t.lead}>
        <ButtonLink href="/koffer/" variante="primary" icon={Briefcase}>
          {t.reservieren}
        </ButtonLink>
      </PageHeader>

      <Section title={t.kennzahlen}>
        <div className="grid grid-cols-2 gap-(--gap) md:grid-cols-4">
          <Kennzahl label={t.verfuegbar} wert={zahl("verfuegbar")} hinweis={stichtag} />
          <Kennzahl label={t.unterwegs} wert={zahl("unterwegs") + zahl("ueberfaellig")} hinweis={stichtag} />
          <Kennzahl label={t.ueberfaellig} wert={zahl("ueberfaellig")} hinweis={stichtag} />
          <Kennzahl label={t.meldungen} wert={offeneMeldungen} hinweis={stichtag} />
        </div>
      </Section>

      <Section title={t.deine} action={<MehrLink href="/ausleihen/">{t.alleAusleihen}</MehrLink>}>
        {meine.length ? (
          <AusleiheListe liste={meine} />
        ) : (
          <EmptyState icon={Briefcase} title={t.deineLeerTitel} text={t.deineLeerText}>
            <ButtonLink href="/koffer/">{de.ausleihen.zuDenKoffern}</ButtonLink>
          </EmptyState>
        )}
      </Section>

      {ueberfaellig.length ? (
        <Section title={t.ueberfaelligTitel}>
          <AusleiheListe liste={ueberfaellig} />
        </Section>
      ) : null}

      <Section title={t.woIst} action={<MehrLink href="/koffer/">{t.alleKoffer}</MehrLink>}>
        {/* Kacheln: am Handy zwei je Reihe, mindestens 112 px hoch */}
        <ul className="grid grid-cols-2 gap-(--gap) md:grid-cols-3 xl:grid-cols-4">
          {KOFFER.map((k, i) => {
            const s = standort(z, k);
            return (
              <li key={k.id}>
                <Link href={`/koffer/${k.id}/`} className="block h-full rounded-card focus-visible:shadow-[0_0_0_3px_var(--ring)]">
                  <Card klickbar className="flex h-full min-h-28 flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-small font-medium text-text-2">{k.nummer}</span>
                      <StatusBadge status={status[i]} />
                    </div>
                    <p className="line-clamp-2 font-medium">{k.name}</p>
                    <div className="mt-auto flex flex-col">
                      <span className="text-small text-text-2">{s.ort}</span>
                      {s.zusatz ? <span className="text-small text-muted">{s.zusatz}</span> : null}
                    </div>
                    <span className="max-sm:hidden">
                      <KategorieLabel k={k.kategorie} />
                    </span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Hinweis title={t.pim}>{t.pimText}</Hinweis>
    </>
  );
}

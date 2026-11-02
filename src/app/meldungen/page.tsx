"use client";

import { MessageSquareWarning } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, ButtonLink, EmptyState, PageHeader, Segmented, Werkzeugleiste, zeigeMeldung } from "@/components/ui";
import { de } from "@/content/de";
import { koffer, person, setzeMeldung, useAusleihe, zuruecksetzen } from "@/lib/ausleihe";
import { ICH, type MeldungStatus } from "@/lib/demo-daten";
import { datum } from "@/lib/utils";

const t = de.meldungen;

export default function Meldungen() {
  const z = useAusleihe();
  const [filter, setFilter] = useState<MeldungStatus | "alle">("offen");
  const liste = z.meldungen.filter((m) => filter === "alle" || m.status === filter).sort((a, b) => b.datum.localeCompare(a.datum));

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <Werkzeugleiste>
        <Segmented
          label={t.filter}
          wert={filter}
          setze={setFilter}
          werte={[
            { id: "offen", name: t.offen },
            { id: "erledigt", name: t.erledigt },
            { id: "alle", name: t.alle },
          ]}
        />
      </Werkzeugleiste>

      {liste.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title={t.leerTitel} text={t.leerText}>
          <ButtonLink href="/koffer/">{de.ausleihen.zuDenKoffern}</ButtonLink>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
          {liste.map((m) => {
            const k = koffer(m.kofferId);
            const mu = k?.muster.find((x) => x.id === m.musterId);
            const p = person(m.personId);
            return (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium">{mu?.bezeichnung}</span>
                    <span className="sm:hidden">
                      <Badge ton={m.status === "erledigt" ? "ok" : "warn"}>{m.status === "erledigt" ? t.erledigt : m.art === "fehlt" ? t.artFehlt : t.artVeraltet}</Badge>
                    </span>
                  </div>
                  <span className="text-small text-muted">
                    <span className="font-mono">{mu?.artikelnr}</span> ·{" "}
                    {k ? (
                      <Link href={`/koffer/${k.id}/`} className="text-accent hover:underline">
                        {k.nummer} {k.name}
                      </Link>
                    ) : null}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <span className="text-small text-text-2">{t.von(m.personId === ICH ? t.du : (p?.name ?? ""), datum(m.datum))}</span>
                  <span className="flex gap-2 max-sm:hidden">
                    <Badge ton="warn">{m.art === "fehlt" ? t.artFehlt : t.artVeraltet}</Badge>
                    {m.status === "erledigt" ? <Badge ton="ok">{t.erledigt}</Badge> : null}
                  </span>
                  {m.status === "offen" ? (
                    <Button
                      groesse="s"
                      onClick={() => {
                        setzeMeldung(m.id, { status: "erledigt" });
                        zeigeMeldung(t.erledigtMeldung(mu?.bezeichnung ?? ""), () => setzeMeldung(m.id, { status: "offen" }));
                      }}
                    >
                      {t.erledigen}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        variante="ghost"
        groesse="s"
        className="w-fit"
        onClick={() => {
          zuruecksetzen();
          zeigeMeldung(de.allgemein.zurueckgesetzt);
        }}
      >
        {de.allgemein.zuruecksetzen}
      </Button>
    </>
  );
}

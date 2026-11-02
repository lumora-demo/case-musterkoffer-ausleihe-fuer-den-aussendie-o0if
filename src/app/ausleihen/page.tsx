"use client";

import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { AusleiheListe } from "@/components/koffer";
import { ButtonLink, EmptyState, PageHeader, Section, Segmented, Werkzeugleiste } from "@/components/ui";
import { de } from "@/content/de";
import { useAusleihe } from "@/lib/ausleihe";
import { ICH, type Reservierung } from "@/lib/demo-daten";

const t = de.ausleihen;

export default function Ausleihen() {
  const z = useAusleihe();
  const [umfang, setUmfang] = useState<"meine" | "alle">("meine");
  const liste = z.reservierungen.filter((r) => umfang === "alle" || r.personId === ICH);
  const nach = (s: Reservierung["status"]) => liste.filter((r) => r.status === s).sort((a, b) => (s === "zurueck" ? b.bis.localeCompare(a.bis) : a.bis.localeCompare(b.bis)));
  const gruppen = [
    { titel: t.laufend, liste: nach("aktiv") },
    { titel: t.geplant, liste: nach("geplant") },
    { titel: t.zurueck, liste: nach("zurueck") },
  ].filter((g) => g.liste.length);

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <Werkzeugleiste>
        <Segmented
          label={t.umfang}
          wert={umfang}
          setze={setUmfang}
          werte={[
            { id: "meine", name: t.meine },
            { id: "alle", name: t.alle },
          ]}
        />
      </Werkzeugleiste>
      {gruppen.length === 0 ? (
        <EmptyState icon={CalendarRange} title={t.leerTitel} text={t.leerText}>
          <ButtonLink href="/koffer/" variante="primary">
            {t.zuDenKoffern}
          </ButtonLink>
        </EmptyState>
      ) : (
        gruppen.map((g) => (
          <Section key={g.titel} title={`${g.titel} · ${g.liste.length}`}>
            <AusleiheListe liste={g.liste} />
          </Section>
        ))
      )}
    </>
  );
}

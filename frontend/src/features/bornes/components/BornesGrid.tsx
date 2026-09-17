import type { Borne } from '@/features/bornes/types/borne.types'
import { BorneGridCell } from '@/features/dashboard/components/BorneGridCell'

type BornesGridProps = {
  bornes: Borne[]
}

export function BornesGrid({ bornes }: BornesGridProps) {
  const groups = bornes.reduce<Record<string, Borne[]>>(
    (result, borne) => {
      const siteName = borne.site.nom

      if (!result[siteName]) {
        result[siteName] = []
      }

      result[siteName].push(borne)
      return result
    },
    {},
  )

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(groups).map(([site, siteBornes]) => (
        <section key={site} aria-labelledby={`site-${site}`}>
          <h2
            id={`site-${site}`}
            className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            {site}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {siteBornes.map((borne) => (
              <BorneGridCell key={borne.id} borne={borne} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
import { Download, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getBorneQrCode } from '@/api/endpoints/bornes'
import type { Borne } from '@/features/bornes/types/borne.types'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Skeleton } from '@/shared/components/Skeleton'

export function QrCodeDisplay({ borne }: { borne: Borne }) {
  const [imageUrl, setImageUrl] = useState<string>()
  const [loadedBorneId, setLoadedBorneId] = useState<string>()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined
    getBorneQrCode(borne.id).then((blob) => { if (active) { objectUrl = URL.createObjectURL(blob); setImageUrl(objectUrl); setLoadedBorneId(borne.id) } }).catch(() => { if (active) setError('QR code indisponible.') })
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [borne.id])

  const download = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${borne.identifiantUnique}.png`
    link.click()
  }

  const print = () => {
    if (!imageUrl) return
    const printWindow = window.open('', '_blank', 'noopener,noreferrer')
    if (!printWindow) return
    printWindow.document.write(`<html><body style="display:grid;place-items:center;min-height:100vh"><img src="${imageUrl}" style="width:360px" alt="QR code ${borne.identifiantUnique}" /></body></html>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const isLoaded = loadedBorneId === borne.id && Boolean(imageUrl)
  return <Card className="flex flex-col items-center gap-5 bg-white p-8 text-center"><div className="flex min-h-64 min-w-64 items-center justify-center rounded-lg border border-slate-200 bg-white p-4">{isLoaded ? <img src={imageUrl} alt={`QR code de ${borne.identifiantUnique}`} className="size-56" /> : error ? <p className="text-sm text-red-600">{error}</p> : <Skeleton className="size-56" />}</div><p className="font-mono text-sm font-semibold text-slate-800">{borne.identifiantUnique}</p><div className="flex gap-3"><Button type="button" variant="secondary" className="gap-2" disabled={!isLoaded} onClick={download}><Download className="size-4" aria-hidden="true" /> Télécharger</Button><Button type="button" variant="secondary" className="gap-2" disabled={!isLoaded} onClick={print}><Printer className="size-4" aria-hidden="true" /> Imprimer</Button></div></Card>
}

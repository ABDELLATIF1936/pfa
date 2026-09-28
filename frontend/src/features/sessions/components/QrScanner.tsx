import { useEffect, useId, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

import { Button } from '@/shared/components/Button'
import { extractBorneIdFromQr } from '@/features/sessions/utils/extractBorneId'

function clearScanner(scanner: Html5Qrcode) {
  try {
    scanner.clear()
  } catch {
    // The scanner may already be cleared during camera shutdown.
  }
}

interface QrScannerProps {
  onDetected: (borneId: string) => void
  onCancel: () => void
}

export function QrScanner({ onDetected, onCancel }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const stoppedRef = useRef(false)
  const readerId = `qr-reader-${useId().replace(/:/g, '')}`
  const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
  const [error, setError] = useState(() => isSecureContext ? '' : 'Le scan caméra nécessite une connexion sécurisée HTTPS, sauf en local.')

  useEffect(() => {
    if (!isSecureContext) {
      return
    }

    const scanner = new Html5Qrcode(readerId)
    scannerRef.current = scanner
    stoppedRef.current = false

    void scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
      async (decodedText) => {
        if (stoppedRef.current) return
        stoppedRef.current = true
        await scanner.stop().catch(() => undefined)
        clearScanner(scanner)
        scannerRef.current = null
        const borneId = extractBorneIdFromQr(decodedText)
        if (borneId) {
          onDetected(borneId)
        } else {
          setError('QR code invalide ou non reconnu.')
          stoppedRef.current = false
        }
      },
      () => undefined,
    ).catch((startError: unknown) => {
      const message = startError instanceof Error ? startError.message.toLowerCase() : String(startError).toLowerCase()
      setError(message.includes('permission') || message.includes('notallowed')
        ? "Accès à la caméra refusé — autorisez l'accès dans les paramètres du navigateur pour scanner un QR code"
        : 'Impossible d’activer la caméra. Vérifiez les permissions du navigateur ou utilisez la saisie manuelle.')
    })

    return () => {
      stoppedRef.current = true
      const activeScanner = scannerRef.current
      scannerRef.current = null
      if (activeScanner) {
        void activeScanner.stop().catch(() => undefined).then(() => clearScanner(activeScanner))
      }
    }
  }, [isSecureContext, onDetected, readerId])

  const handleCancel = () => {
    stoppedRef.current = true
    const scanner = scannerRef.current
    scannerRef.current = null
    if (scanner) {
      void scanner.stop().catch(() => undefined).then(() => clearScanner(scanner))
    }
    onCancel()
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-client-dark-bg p-3">
        <div id={readerId} className="min-h-[310px] overflow-hidden rounded-xl" />
        <div className="pointer-events-none absolute inset-10 rounded-xl border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(52,211,153,.25)]">
          <span className="absolute -left-1 -top-1 h-8 w-8 border-l-4 border-t-4 border-emerald-300" />
          <span className="absolute -right-1 -top-1 h-8 w-8 border-r-4 border-t-4 border-emerald-300" />
          <span className="absolute -bottom-1 -left-1 h-8 w-8 border-b-4 border-l-4 border-emerald-300" />
          <span className="absolute -bottom-1 -right-1 h-8 w-8 border-b-4 border-r-4 border-emerald-300" />
          <span className="absolute left-2 right-2 top-1/2 h-px animate-pulse bg-emerald-300/80" />
        </div>
        <div className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-2 rounded-full bg-client-dark-bg/90 px-3 py-1.5 text-xs text-white/75"><Camera className="size-3.5 text-emerald-300" />Placez le QR code dans le cadre</div>
      </div>
      {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <Button type="button" variant="secondary" className="w-full gap-2" onClick={handleCancel}><X className="size-4" />Annuler</Button>
    </div>
  )
}

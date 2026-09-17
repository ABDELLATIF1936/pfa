import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, CheckCircle2, LoaderCircle, PlugZap, ScanLine } from 'lucide-react'

import { QrScanner } from '@/features/sessions/components/QrScanner'
import { useStartSessionQr } from '@/features/sessions/hooks/useStartSessionQr'
import { extractBorneIdFromQr } from '@/features/sessions/utils/extractBorneId'
import { ROUTES } from '@/routes/routes.config'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'

export function ScanQrPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const [manualError, setManualError] = useState('')
  const { start, isLoading, error, response } = useStartSessionQr()

  const handleDetected = useCallback((borneId: string) => {
    setIsScanning(false)
    void start(borneId)
  }, [start])

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const borneId = extractBorneIdFromQr(manualValue)
    if (!borneId) {
      setManualError('Identifiant invalide. Exemple : B_xxxxxxxx_xxxxxxxx')
      return
    }
    setManualError('')
    void start(borneId)
  }

  const reset = () => {
    setManualError('')
    setManualValue('')
    setIsScanning(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <Link to={ROUTES.HOME} className="mb-8 flex items-center justify-center gap-3 text-sm font-semibold tracking-[0.18em] text-slate-800">
          <span className="flex size-10 items-center justify-center rounded-xl bg-client-dark-bg text-white"><PlugZap className="size-5" /></span>
          VOLTWAY
        </Link>
        <Card className="overflow-hidden border-slate-200/80 shadow-[0_24px_70px_-35px_rgba(15,23,42,.35)]">
          <div className="border-b border-slate-100 bg-white px-6 py-7 text-center sm:px-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-300 to-brand-blue text-slate-950 shadow-[0_0_28px_rgba(52,211,153,.28)]"><ScanLine className="size-7" /></div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">Démarrer une recharge</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Scannez le QR code de la borne pour lancer votre session.</p>
          </div>

          <div className="space-y-6 px-6 py-7 sm:px-10">
            {isLoading ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
                <LoaderCircle className="size-10 animate-spin text-emerald-600" />
                <div><p className="font-semibold text-slate-900">Démarrage de la charge...</p><p className="mt-1 text-sm text-slate-500">La borne confirme la commande. Cette opération peut prendre quelques secondes.</p></div>
              </div>
            ) : response ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
                <CheckCircle2 className="size-12 text-emerald-600" />
                <div><p className="font-semibold text-slate-900">Démarrage en cours...</p><p className="mt-1 text-sm text-slate-500">La session apparaîtra dès que la borne aura confirmé la commande.</p></div>
                <Link to={ROUTES.SESSIONS} className="text-sm font-semibold text-emerald-700 hover:underline">Voir mes sessions</Link>
              </div>
            ) : isScanning ? (
              <QrScanner onDetected={handleDetected} onCancel={() => setIsScanning(false)} />
            ) : (
              <div className="space-y-5">
                {error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error.message}</div> : null}
                {manualError ? <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">{manualError}</div> : null}
                <Button type="button" className="w-full gap-2" onClick={() => setIsScanning(true)}><Camera className="size-4" />Scanner un QR code</Button>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou<span className="h-px flex-1 bg-slate-200" /></div>
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <Input id="borne-identifiant" label="Saisir l'identifiant manuellement" placeholder="B_xxxxxxxx_xxxxxxxx" value={manualValue} onChange={(event) => setManualValue(event.target.value)} error={manualError || undefined} />
                  <Button type="submit" variant="secondary" className="w-full">Valider l'identifiant</Button>
                </form>
                <p className="text-center text-xs leading-5 text-slate-400">Le scan caméra nécessite HTTPS (sauf en localhost). La saisie manuelle reste disponible pour les tests.</p>
              </div>
            )}
            {response && !isLoading ? <Button type="button" variant="secondary" className="w-full" onClick={reset}>Scanner une autre borne</Button> : null}
          </div>
        </Card>
      </div>
    </main>
  )
}

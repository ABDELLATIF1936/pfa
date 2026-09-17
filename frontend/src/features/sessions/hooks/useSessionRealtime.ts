import { useEffect, useState } from 'react'

import { getSessionById, getSessionStatus } from '@/api/endpoints/sessions'
import { createSocket } from '@/api/socket'
import type { SessionDetail, SessionStatus } from '@/features/sessions/types/session.types'

type ConnectionMode = 'connecting' | 'realtime' | 'polling' | 'error'

export function useSessionRealtime(sessionId: string | undefined) {
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('connecting')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      return
    }

    let cancelled = false
    let pollingTimer: ReturnType<typeof setInterval> | undefined
    let counterTimer: ReturnType<typeof setInterval> | undefined
    const socket = createSocket()
    const sessionRef = { current: null as SessionDetail | null }
    const statusRef = { current: null as SessionStatus | null }

    const applyStatus = (nextStatus: SessionStatus) => {
      if (cancelled) return
      statusRef.current = nextStatus
      setStatus(nextStatus)
      setSession((current) => {
        sessionRef.current = current
        return current ? {
        ...current,
        energieConsommee: nextStatus.energieConsommee,
        statut: nextStatus.statut,
        borne: nextStatus.borne ?? current.borne,
        } : current
      })
    }

    const enablePolling = () => {
      if (cancelled || pollingTimer) return
      setConnectionMode('polling')
      pollingTimer = setInterval(() => {
        void getSessionStatus(sessionId).then(applyStatus).catch(() => undefined)
      }, 5000)
    }

    const fallbackTimer = setTimeout(enablePolling, 3000)

    const handleConnect = () => {
      if (cancelled) return
      setConnectionMode('realtime')
      if (fallbackTimer) clearTimeout(fallbackTimer)
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = undefined
      }
      socket.emit('session:subscribe', { sessionId })
    }

    const handleDisconnect = () => enablePolling()
    const handleUpdate = (payload: SessionStatus) => applyStatus(payload)
    const handleInterrupted = (payload: { raison?: string }) => {
      applyStatus({
        energieConsommee: statusRef.current?.energieConsommee ?? sessionRef.current?.energieConsommee ?? 0,
        tempsEcoule: statusRef.current?.tempsEcoule ?? 0,
        statut: 'interrompue',
        borne: statusRef.current?.borne ?? sessionRef.current?.borne ?? { identifiantUnique: '' },
        raison: payload.raison,
      })
    }
    const handleEnded = (payload: { montant?: number }) => {
      applyStatus({
        energieConsommee: statusRef.current?.energieConsommee ?? sessionRef.current?.energieConsommee ?? 0,
        tempsEcoule: statusRef.current?.tempsEcoule ?? 0,
        statut: 'terminee',
        borne: statusRef.current?.borne ?? sessionRef.current?.borne ?? { identifiantUnique: '' },
        montant: payload.montant,
      })
    }

    void getSessionById(sessionId).then((loaded) => {
      if (cancelled) return
      sessionRef.current = loaded
      setSession(loaded)
      const initialStatus = { energieConsommee: loaded.energieConsommee, tempsEcoule: loaded.dateFin ? Math.floor((new Date(loaded.dateFin).getTime() - new Date(loaded.dateDebut).getTime()) / 1000) : Math.floor((Date.now() - new Date(loaded.dateDebut).getTime()) / 1000), statut: loaded.statut, borne: loaded.borne }
      statusRef.current = initialStatus
      setStatus(initialStatus)
      counterTimer = setInterval(() => setStatus((current) => {
        if (!current || current.statut !== 'en_cours') return current
        const next = { ...current, tempsEcoule: current.tempsEcoule + 1 }
        statusRef.current = next
        return next
      }), 1000)
    }).catch(() => {
      if (!cancelled) setError('Impossible de charger le suivi de cette session.')
    })

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', enablePolling)
    socket.on('session:update', handleUpdate)
    socket.on('session:interrupted', handleInterrupted)
    socket.on('session:ended', handleEnded)
    socket.connect()
    return () => {
      cancelled = true
      if (pollingTimer) clearInterval(pollingTimer)
      clearTimeout(fallbackTimer)
      if (counterTimer) clearInterval(counterTimer)
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [sessionId])

  return { session, status, connectionMode, error: error ?? (!sessionId ? 'Session introuvable.' : null) }
}
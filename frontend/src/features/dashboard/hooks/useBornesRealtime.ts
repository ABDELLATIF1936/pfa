import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Socket } from 'socket.io-client'

import { getBornes } from '@/api/endpoints/bornes'
import { createSocket } from '@/api/socket'
import type { Borne, StatutBorne } from '@/features/bornes/types/borne.types'

interface StatutChangePayload {
  borneId: string
  identifiantUnique: string
  nouveauStatut: StatutBorne
  timestamp: string
}

export function useBornesRealtime() {
  const [bornes, setBornes] = useState<Borne[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const previousStatuses = useRef(new Map<string, StatutBorne>())

  useEffect(() => {
    let active = true
    const socket: Socket = createSocket()

    getBornes().then((data) => {
      if (!active) return
      setBornes(data)
      previousStatuses.current = new Map(data.map((borne) => [borne.id, borne.statut]))
    }).catch(() => toast.error('Impossible de charger les bornes du dashboard.'))

    const handleConnect = () => {
      setIsConnected(true)
      socket.emit('dashboard:request')
    }
    const handleDisconnect = () => setIsConnected(false)
    const handleConnectError = () => setIsConnected(false)
    const handleDashboardUpdate = (overview: { bornes?: Borne[] }) => {
      if (!overview.bornes) return
      setBornes(overview.bornes)
      previousStatuses.current = new Map(overview.bornes.map((borne) => [borne.id, borne.statut]))
    }
    const handleStatusChange = (payload: StatutChangePayload) => {
      setBornes((current) => current.map((borne) => {
        if (borne.id !== payload.borneId) return borne
        const previousStatus = previousStatuses.current.get(borne.id) ?? borne.statut
        if (payload.nouveauStatut === 'en_panne' && previousStatus !== 'en_panne') {
          toast.error(`La borne ${payload.identifiantUnique} est tombée en panne`, { duration: 6000 })
        }
        previousStatuses.current.set(borne.id, payload.nouveauStatut)
        return { ...borne, statut: payload.nouveauStatut, updatedAt: payload.timestamp }
      }))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('dashboard:update', handleDashboardUpdate)
    socket.on('borne:statut-change', handleStatusChange)
    socket.connect()

    return () => {
      active = false
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('dashboard:update', handleDashboardUpdate)
      socket.off('borne:statut-change', handleStatusChange)
      socket.disconnect()
    }
  }, [])

  return { bornes, isConnected }
}

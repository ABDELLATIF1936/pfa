import { io, type Socket } from 'socket.io-client'

import { useAuthStore } from '@/features/auth/store/authStore'

let activeSocket: Socket | null = null

export const createSocket = (): Socket => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
  const socketUrl = configuredUrl.endsWith('/bornes') ? configuredUrl : `${configuredUrl.replace(/\/$/, '')}/bornes`
  const token = useAuthStore.getState().token

  activeSocket = io(socketUrl, {
    autoConnect: false,
    auth: {
      token: token ?? null,
    },
    transports: ['websocket'],
  })

  return activeSocket
}

export const disconnectSocket = (): void => {
  activeSocket?.disconnect()
  activeSocket = null
}

/*
 * L'accès à la caméra via html5-qrcode nécessite HTTPS en production.
 * En dev local sur localhost, HTTP est généralement autorisé par les navigateurs.
 */

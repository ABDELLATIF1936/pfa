import axios from 'axios'

import api from '@/api/client'
import type { SessionDetail, SessionStatus, StartQrError, StartSessionResponse } from '@/features/sessions/types/session.types'

export async function startSessionQr(identifiantBorne: string): Promise<StartSessionResponse> {
  try {
    const { data } = await api.post<StartSessionResponse>('/sessions/start-qr', { identifiantBorne })
    return data
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    const code: StartQrError['code'] = status === 404 || status === 409 || status === 503
      ? status
      : axios.isAxiosError(error) && !error.response ? 'NETWORK' : 'UNKNOWN'
    const responseMessage = axios.isAxiosError(error) ? error.response?.data?.message : undefined
    const message = Array.isArray(responseMessage) ? responseMessage.join(', ') : responseMessage
    throw { code, message: typeof message === 'string' ? message : 'Impossible de démarrer la session.' } satisfies StartQrError
  }
}

export async function getSessions(): Promise<SessionDetail[]> {
  const { data } = await api.get<SessionDetail[]>('/sessions')
  return data
}

export async function getSessionById(id: string): Promise<SessionDetail> {
  const { data } = await api.get<SessionDetail>(`/sessions/${id}`)
  return data
}

export async function getSessionStatus(id: string): Promise<SessionStatus> {
  const { data } = await api.get<SessionStatus>(`/sessions/${id}/status`)
  return data
}

export async function stopSession(id: string): Promise<void> {
  await api.post(`/sessions/${id}/stop`)
}
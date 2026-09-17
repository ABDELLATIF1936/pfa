import api from '@/api/client'
import type { ActiveSessionSummary, BorneAlert, BornesStatusSummary } from '@/features/dashboard/types/dashboard.types'
import type { RevenueStats, SessionsStats, TopSite } from '@/features/dashboard/types/stats.types'

export interface DashboardStatsFilters {
  dateDebut?: string
  dateFin?: string
  siteId?: string
}

export const getBornesStatus = async (): Promise<BornesStatusSummary> => {
  const { data } = await api.get<BornesStatusSummary>('/dashboard/bornes-status')
  return data
}

export const getSessionsActives = async (): Promise<ActiveSessionSummary[]> => {
  const { data } = await api.get<ActiveSessionSummary[]>('/dashboard/sessions-actives')
  return data
}

export const getAlertes = async (): Promise<BorneAlert[]> => {
  const { data } = await api.get<BorneAlert[]>('/dashboard/alertes')
  return data
}

export const getRevenueStats = async (filters: DashboardStatsFilters = {}): Promise<RevenueStats> => {
  const { data } = await api.get<RevenueStats>('/dashboard/stats/revenue', { params: filters })
  return data
}

export const getSessionsStats = async (filters: DashboardStatsFilters = {}): Promise<SessionsStats> => {
  const { data } = await api.get<SessionsStats>('/dashboard/stats/sessions', { params: filters })
  return data
}

export const getTopSites = async (filters: DashboardStatsFilters & { limit?: number } = {}): Promise<TopSite[]> => {
  const { data } = await api.get<TopSite[]>('/dashboard/stats/top-sites', { params: filters })
  return data
}

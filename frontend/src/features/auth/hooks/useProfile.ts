import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { getMe, updateMe, uploadPhoto as uploadPhotoRequest } from '@/api/endpoints/users'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { Personne, UpdateProfilePayload } from '@/features/auth/types/auth.types'

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response
    if (response && typeof response === 'object' && 'data' in response) {
      const message = response.data && typeof response.data === 'object' && 'message' in response.data
        ? response.data.message
        : undefined
      if (Array.isArray(message)) return message.join(', ')
      if (typeof message === 'string') return message
    }
  }

  return error instanceof Error ? error.message : fallback
}

export function useProfile() {
  const [profile, setProfile] = useState<Personne | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const syncProfile = useCallback((nextProfile: Personne) => {
    setProfile(nextProfile)
    setError(null)
    useAuthStore.getState().setUser(nextProfile)
  }, [])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const nextProfile = await getMe()
      syncProfile(nextProfile)
      return nextProfile
    } catch (requestError: unknown) {
      const message = getErrorMessage(requestError, 'Impossible de charger votre profil')
      setError(message)
      toast.error(message)
      throw requestError
    } finally {
      setIsLoading(false)
    }
  }, [syncProfile])

  useEffect(() => {
    const request = window.setTimeout(() => {
      void refetch().catch(() => undefined)
    }, 0)

    return () => window.clearTimeout(request)
  }, [refetch])

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    try {
      const nextProfile = await updateMe(payload)
      syncProfile(nextProfile)
      toast.success('Profil mis à jour')
      return nextProfile
    } catch (requestError: unknown) {
      const message = getErrorMessage(requestError, 'Impossible de mettre à jour le profil')
      setError(message)
      toast.error(message)
      throw requestError
    }
  }, [syncProfile])

  const uploadPhoto = useCallback(async (file: File) => {
    try {
      const { photo_url } = await uploadPhotoRequest(file)
      const currentProfile = useAuthStore.getState().user
      if (currentProfile) syncProfile({ ...currentProfile, photoUrl: photo_url })
      toast.success('Photo de profil mise à jour')
      return { photo_url }
    } catch (requestError: unknown) {
      const message = getErrorMessage(requestError, 'Impossible de téléverser la photo')
      setError(message)
      toast.error(message)
      throw requestError
    }
  }, [syncProfile])

  return { profile, isLoading, error, updateProfile, uploadPhoto, refetch }
}
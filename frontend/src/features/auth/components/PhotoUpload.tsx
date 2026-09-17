import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ImagePlus } from 'lucide-react'

import { useProfile } from '@/features/auth/hooks/useProfile'
import { getProfilePhotoUrl } from '@/features/auth/utils/profilePhoto'
import type { Personne } from '@/features/auth/types/auth.types'
import { Button } from '@/shared/components/Button'

interface PhotoUploadProps {
  profile: Personne
  uploadPhoto: ReturnType<typeof useProfile>['uploadPhoto']
}

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export function PhotoUpload({ profile, uploadPhoto }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const chooseFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return
    setError(null)
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError('Seuls les fichiers JPG et PNG sont acceptés.')
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('La photo ne doit pas dépasser 2 Mo.')
      return
    }
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const savePhoto = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      await uploadPhoto(file)
      setFile(null)
      setPreviewUrl(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      // Le hook affiche et expose l’erreur; le choix local est conservé pour réessayer.
    } finally {
      setIsUploading(false)
    }
  }

  const imageUrl = previewUrl ?? getProfilePhotoUrl(profile.photoUrl)
  const initials = `${profile.prenom[0] ?? ''}${profile.nom[0] ?? ''}`.toUpperCase()

  return (
    <section className="flex flex-col items-center gap-4 sm:flex-row">
      <button
        type="button"
        className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-2xl font-bold text-accent-foreground ring-4 ring-accent/40"
        onClick={() => inputRef.current?.click()}
        aria-label="Choisir une photo de profil"
      >
        {imageUrl ? <img src={imageUrl} alt="Photo de profil" className="h-full w-full object-cover" /> : initials}
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/50 text-background opacity-0 transition group-hover:opacity-100"><Camera className="size-5" aria-hidden="true" /></span>
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />
      <div className="text-center sm:text-left">
        <h2 className="text-lg font-semibold text-foreground">Photo de profil</h2>
        <p className="mt-1 text-sm text-muted-foreground">JPG ou PNG, 2 Mo maximum.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button type="button" variant="secondary" className="gap-2" onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" aria-hidden="true" /> Changer la photo</Button>
          {file ? <Button type="button" isLoading={isUploading} className="gap-2" onClick={() => void savePhoto()}><Check className="size-4" aria-hidden="true" /> Enregistrer</Button> : null}
        </div>
        {error ? <p className="mt-2 text-sm text-red-600" role="alert">{error}</p> : null}
      </div>
    </section>
  )
}
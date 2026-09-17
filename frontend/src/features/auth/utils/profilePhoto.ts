export function getProfilePhotoUrl(photoUrl: string | null | undefined) {
  if (!photoUrl) return null
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined
  if (!apiUrl || !/^https?:\/\//i.test(apiUrl)) return photoUrl

  const serverUrl = apiUrl.replace(/\/api\/?$/, '')
  return new URL(photoUrl, `${serverUrl}/`).toString()
}
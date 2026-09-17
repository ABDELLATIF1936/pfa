export function triggerPdfDownload(blob: Blob, filename: string): void {
  const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })
  const objectUrl = URL.createObjectURL(pdfBlob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  window.setTimeout(() => {
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}
import { Toaster } from 'react-hot-toast'

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#fff',
        },
      }}
    />
  )
}

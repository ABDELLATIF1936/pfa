import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from '@/routes/AppRoutes'
import { AppToaster } from '@/shared/components/Toast'

function App() {
  return (
    <BrowserRouter>
      <AppToaster />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App

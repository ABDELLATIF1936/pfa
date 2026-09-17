import type { NavigateFunction } from 'react-router-dom'

let navigate: NavigateFunction | null = null

export const navigationService = {
  setNavigate(navigateFunction: NavigateFunction) {
    navigate = navigateFunction
  },
  navigate(path: string) {
    navigate?.(path)
  },
}

export default navigationService

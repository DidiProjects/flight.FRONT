import { AppProviders } from '@providers/AppProviders'
import { AppRoutes } from '@routes/index'

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}

import { useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { toastEmitter } from '@utils/toast'

export function useToastListener() {
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const unsubscribe = toastEmitter.subscribe(({ message, variant }) => {
      enqueueSnackbar(message, { variant })
    })
    return unsubscribe
  }, [enqueueSnackbar])
}

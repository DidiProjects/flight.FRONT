type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastEvent {
  message: string
  variant: ToastVariant
}

type ToastListener = (event: ToastEvent) => void

const listeners = new Set<ToastListener>()

export const toastEmitter = {
  subscribe: (listener: ToastListener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  emit: (message: string, variant: ToastVariant = 'info') => {
    listeners.forEach((listener) => listener({ message, variant }))
  },

  success: (message: string) => toastEmitter.emit(message, 'success'),
  error: (message: string) => toastEmitter.emit(message, 'error'),
  warning: (message: string) => toastEmitter.emit(message, 'warning'),
  info: (message: string) => toastEmitter.emit(message, 'info'),
}

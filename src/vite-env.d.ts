/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_AUTHOR_NAME: string
  readonly VITE_AUTHOR_GITHUB: string
  readonly VITE_FEEDBACK_EMAIL: string
  /** '1' turns on the on-screen console (Eruda). Set by `start:exposed`. */
  readonly VITE_MOBILE_CONSOLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

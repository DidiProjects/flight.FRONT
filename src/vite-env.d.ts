/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_AUTHOR_NAME: string
  readonly VITE_AUTHOR_GITHUB: string
  readonly VITE_FEEDBACK_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

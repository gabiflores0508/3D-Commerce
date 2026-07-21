/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Chave da API de rastreio SeuRastreio (formato sr_live_...). */
  readonly VITE_SEURASTREIO_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

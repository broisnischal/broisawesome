/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_VERSION: string;
  readonly VITE_BUILD_COMMIT: string;
  readonly VITE_BUILD_MODIFIED: string;
  /** JSON: `{ hash, subject, add, del }[]`, newest first. */
  readonly VITE_BUILD_LOG: string;
}

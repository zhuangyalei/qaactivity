/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string; // 定义一个自定义环境变量
  readonly VITE_WEB_URL: string; // 定义另一个变量
  readonly VITE_EDIT_INFO_URL: string;
  readonly VITE_AUTHENTICATION_URL: string;
  readonly VITE_WXSHARE_API_URL: string;
  readonly VITE_DOCTOR_API_URL: string;
  readonly VITE_DOCTOR_WEB_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

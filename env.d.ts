/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

// uni-app 全局变量声明
interface Window {
  __wxjs_environment?: string
}

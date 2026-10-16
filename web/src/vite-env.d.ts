/// <reference types="vite/client" />
/// <reference types="mdx" />

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

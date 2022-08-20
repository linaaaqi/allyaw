// less模块声明
declare module '*.less' {
  const less: { [key: string]: any }
  export default less
}

// css模块声明
declare module '*.css' {
  const css: { [key: string]: any }
  export default css
}

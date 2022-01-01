import { RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'

const bundle = (config): RollupOptions => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id)
})

export const libOptions = bundle({
  plugins: [
    postcss({
      modules: true,
      extract: true,
      minimize: true
    }),
    esbuild()
  ],
  output: [
    {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true
    },
    {
      dir: 'es',
      format: 'es',
      sourcemap: true,
      preserveModules: true
    }
  ]
})

export const typingOptions = bundle({
  plugins: [dts()],
  output: [
    {
      dir: 'lib',
      format: 'cjs',
      preserveModules: true
    },
    {
      dir: 'es',
      format: 'es',
      preserveModules: true
    }
  ]
})

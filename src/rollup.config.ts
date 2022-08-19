import { RollupOptions } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'
import progress from 'rollup-plugin-progress'

export const getBundleOptions = (): RollupOptions => ({
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
  plugins: [
    progress({
      clearLine: true // default: true
    }),
    postcss({
      modules: true,
      extract: true,
      minimize: true
    }),
    esbuild()
  ],
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true
    }
  ]
})

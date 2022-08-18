import { RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
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
    esbuild(),
    dts()
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
      sourcemap: true,
      preserveModules: true
    }
  ],
  treeshake: 'recommended'
})

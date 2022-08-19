import { RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'
import progress from 'rollup-plugin-progress'

const getBundleOptions = (...configs: RollupOptions[]): RollupOptions => configs.reduce((acc, config) => ({
  ...acc,
  ...config
}))

const commonOptions: RollupOptions = {
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id)
}

export const libOptions = getBundleOptions(commonOptions, {
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

export const typeOptions = getBundleOptions(commonOptions, {
  plugins: [dts()],
  output: {
    dir: 'dist/types',
    preserveModules: true
  }
})

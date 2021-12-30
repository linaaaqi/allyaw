import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import less from 'rollup-plugin-less';

const bundle = config => ({
  ...config,
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id)
})

export default [
  bundle({
    plugins: [
      esbuild({
        target: 'ES5'
      }),
      less()
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
  }),
  bundle({
    plugins: [dts()],
    output: [
      {
        dir: 'lib',
        format: 'es',
        preserveModules: true
      },
      {
        dir: 'es',
        format: 'es',
        preserveModules: true
      }
    ]
  })
]

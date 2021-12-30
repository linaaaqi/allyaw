import type { Arguments, CommandBuilder } from 'yargs';
import chalk from 'chalk';
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { RollupOptions } from 'rollup'
import less from 'rollup-plugin-less';

type Options = {
  config: string | undefined
}

export const command = 'compile'
export const desc = '打包组件'

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      config: {
        alias: 'c',
        describe: '编译配置文件',
        type: 'string'
      }
    })

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config } = argv
  process.stdout.write(chalk.green('读取配置文件成功!\r\n'))

  if (config) {
    process.stdout.write(chalk.green('配置文件地址：', config))
  }

  const bundle = await rollup(inputOptions)

  console.log(bundle); // an array of external dependencies
}

const inputOptions: RollupOptions = {
  input: 'src/index.ts',
  external: id => !/^[./]/.test(id),
  plugins: [
    esbuild(),
    less()
  ]
}

import type { Arguments, CommandBuilder } from 'yargs';
import chalk from 'chalk';

type Options = {
  name: string
  path: string | undefined
}

export const command = 'create <name>'
export const desc = '使用<name>作为名称创建组件'

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      path: {
        alias: 'p',
        describe: '输出文件目录',
        type: 'string'
      }
    })
    .positional('name', {
      type: 'string',
      demandOption: true
    })

export const handler = (argv: Arguments<Options>): void => {
  const defaultPath = 'components'
  const { name, path = defaultPath } = argv

  process.stdout.write(chalk.green('正在处理中...'))

  process.stdout.write('\r\n')
  process.exit(0)
}

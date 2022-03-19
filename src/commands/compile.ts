import chalk from 'chalk';
import ora from 'ora'
import { rollup } from 'rollup'
import type { Arguments } from 'yargs';
import { libOptions, typingOptions } from '../rollup.config.js'

type Options = {
  config?: string | undefined
}

const module = {
  command: 'compile',
  desc: '📦 打包组件',
  builder: (yargs) =>
    yargs
      .options({
        config: {
          alias: 'c',
          describe: '编译配置文件',
          type: 'string'
        }
      }),
  handler: async (argv: Arguments<Options>) => {
    const { config } = argv
    process.stdout.write(chalk.green('读取配置文件成功!\r\n'))

    if (config) {
      process.stdout.write(chalk.green('配置文件地址：', config))
    }

    const spinner = ora('正在编译组件...').start()

    const { output: libOutputOptions, ...libInputOptions } = libOptions
    const libBundle = await rollup(libInputOptions)

    if (!libOutputOptions) {
      process.exit(1)
    }

    if (Array.isArray(libOutputOptions)) {
      for (const libOutputOption of libOutputOptions) {
        // or write the bundle to disk
        await libBundle.write(libOutputOption);
      }
    } else {
      // or write the bundle to disk
      await libBundle.write(libOutputOptions);
    }

    // closes the bundle
    await libBundle.close();

    const { output: typingOutputOptions, ...typingInputOptions } = typingOptions
    const typingBundle = await rollup(typingInputOptions)

    if (!typingOutputOptions) {
      process.exit(1)
    }

    if (Array.isArray(typingOutputOptions)) {
      for (const typingOutputOption of typingOutputOptions) {
        // or write the bundle to disk
        await typingBundle.write(typingOutputOption);
      }
    } else {
      // or write the bundle to disk
      await typingBundle.write(typingOutputOptions);
    }

    spinner.succeed()

    // closes the bundle
    await typingBundle.close();
  }
}

export default module

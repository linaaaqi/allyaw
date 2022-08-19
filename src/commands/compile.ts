import chalk from 'chalk';
import { execSync } from 'child_process'
import * as fs from 'fs'
import path from 'path'
import { rollup } from 'rollup'
import { CommandModule } from 'yargs'
import type { Arguments } from 'yargs';
import { libOptions, typeOptions } from '../rollup.config.js'

type Options = {
  config?: string | undefined
}

const bundler = async (libInputOptions, libOutputOptions) => {
  const libBundle = await rollup(libInputOptions)

  if (!libOutputOptions) {
    process.stdout.write(chalk.red('缺少编译配置文件！\r\n'))
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
}

const commander: CommandModule = {
  command: 'compile',
  describe: '📦 打包组件',
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

    if (config) {
      // TODO: 合并用户指定配置项
    }

    // TODO: 读取执行目录下的rollup.config.js

    const isPnpmWorkspace = fs.existsSync(path.join(process.cwd(), 'pnpm-workspace.yaml'))

    const pkgs: [string, string][] = [];

    if (isPnpmWorkspace) {
      JSON.parse(execSync('pnpm list -r --json', {
          stdio: 'pipe',
        })
          .toString()
          .replace(/([\r\n]])[^]*$/, '$1')
      ).filter(pkg => pkg.path !== process.cwd()) // filter root pkg
        .forEach(pkg => {
          pkgs.push([pkg.name, pkg.path]);
        });
    } else {
      const packageJson = require(path.join(process.cwd(), 'package.json'))
      pkgs.push([packageJson.name, process.cwd()]);
    }

    for (const [pkgName, pkgPath] of pkgs) {
      try {
        process.chdir(pkgPath)
      } catch (e) {
        process.stdout.write(chalk.red(`${ pkgName } 路径不存在！\r\n`))
        process.exit(1)
      }

      const { output: libOutputOptions, ...libInputOptions } = libOptions
      await bundler(libInputOptions, libOutputOptions)

      // const { output: dtsOutputOptions, ...dtsInputOptions } = typeOptions
      // await bundler(dtsInputOptions, dtsOutputOptions)

      process.stdout.write(chalk.green(`${ pkgName } 编译完成！\r\n`))
    }
  }
}

export default commander

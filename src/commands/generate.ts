import axios from 'axios'
import chalk from 'chalk'
import * as child_process from 'child_process'
import * as fs from 'fs'
import ora from 'ora'
import { Arguments } from 'yargs'

type Options = {
  host?: string | undefined
}

const module = {
  command: 'generate',
  desc: '生成API接口文件',
  builder: (yargs) =>
    yargs
      .options({
        host: {
          alias: 'H',
          describe: '编译配置文件',
          type: 'string'
        }
      }),
  handler: async (argv: Arguments<Options>): Promise<void> => {
    const url = argv.host ?? 'https://osstest.tf56.com'

    let spinner = ora(`正在从 ${ url } 处加载API文件\n`).start()

    axios.get(`${ url }/teamWorkApi/v2/api-docs`)
      .then(({ data: swagger }) => {
        spinner.text = '正在处理数据\n'

        for (const pathsKey in swagger.paths) {
          const path = swagger.paths[pathsKey]

          for (const pathKey in path) {
            path[pathKey].operationId = path[pathKey].operationId.replace(/Using(GET|POST)_?\d?/, '')
            path[pathKey].operationId = path[pathKey].operationId.replace(/_\d/, '')
          }
        }

        spinner.text = '数据写入中...\n'
        const swaggerBuffer = Buffer.from(JSON.stringify(swagger))

        fs.writeFile('swagger.json', swaggerBuffer, err => {
          if (err) {
            spinner.fail('swagger 文件生成失败')
            process.stdout.write(chalk.red('写入文件失败\n'))
            process.exit(1)
          }

          spinner.succeed('swagger 文件已生成')
          spinner = ora(`开始生成API文件\n`).start()

          const openapi = child_process.spawn('openapi-generator-cli', [
            'generate',
            '--skip-validate-spec',
            '-i',
            'swagger.json',
            '-c',
            'openapi.generator.config.json',
            '-g',
            'typescript-axios',
            '-t',
            'src/templates/typescript-axios',
            '-o',
            'src'
          ])

          openapi.stdout.on('error', err => {
            console.error(err)
          })

          openapi.stdout.on('close', code => {
            if (code !== 0) {
              spinner.fail('API文件生成失败')
              process.stdout.write(chalk.red('生成失败\n'))
              process.exit(1)
            } else {
              spinner.succeed('API文件生成完毕\n')
            }
          })
        })
      })
      .catch(error => {
        spinner.stop()
        console.log(error)
        process.stdout.write(chalk.red('接口文件获取失败\n'))
        process.exit(1)
      })
  }
}

export default module

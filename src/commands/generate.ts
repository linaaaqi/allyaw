import axios from 'axios'
import chalk from 'chalk'
import * as child_process from 'child_process'
import * as fs from 'fs'
import { Arguments, CommandModule } from 'yargs'

type Options = {
  host?: string | undefined
  config?: string | undefined
  template?: string | undefined
  outputDir?: string | undefined
}

const commander: CommandModule = {
  command: 'generate',
  describe: '📃 生成API接口文件',
  builder: (yargs) =>
    yargs
      .options({
        host: {
          alias: 'H',
          describe: '接口文件托管域名',
          type: 'string'
        },
        config: {
          alias: 'c',
          describe: '配置文件地址',
          type: 'string'
        },
        template: {
          alias: 't',
          describe: '模板文件地址',
          type: 'string'
        },
        outputDir: {
          alias: 'o',
          describe: '输出目录',
          type: 'string'
        }
      }),
  handler: async (argv: Arguments<Options>) => {
    const url = argv.host ?? 'https://osstest.tf56.com'
    const config = argv.config ?? 'openapi.generator.config.json'
    const template = argv.template ?? 'src/templates/typescript-axios'
    const outputDir = argv.outputDir ?? 'src'

    axios.get(`${ url }/teamWorkApi/v2/api-docs`)
      .then(({ data: swagger }) => {
        for (const pathsKey in swagger.paths) {
          const path = swagger.paths[pathsKey]

          for (const pathKey in path) {
            path[pathKey].operationId = path[pathKey].operationId.replace(/Using(GET|POST)_?\d?/, '')
            path[pathKey].operationId = path[pathKey].operationId.replace(/_\d/, '')
          }
        }

        const swaggerBuffer = Buffer.from(JSON.stringify(swagger))

        fs.writeFile('swagger.json', swaggerBuffer, err => {
          if (err) {
            process.stdout.write(chalk.red('写入文件失败\n'))
            process.exit(1)
          }

          const openapi = child_process.spawn('openapi-generator-cli', [
            'generate',
            '--skip-validate-spec',
            '-i',
            'swagger.json',
            '-c',
            config,
            '-g',
            'typescript-axios',
            '-t',
            template,
            '-o',
            outputDir
          ], {
            shell: true,
            cwd: process.cwd()
          })

          openapi.stdout.on('data', (data) => {
            console.log(data.toString())
          })

          openapi.stdout.on('error', err => {
            console.error(err)
          })
        })
      })
      .catch(error => {
        console.log(error)
        process.stdout.write(chalk.red('接口文件获取失败\n'))
        process.exit(1)
      })
  }
}

export default commander

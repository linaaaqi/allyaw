import axios from 'axios'
import chalk from 'chalk'
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

    const spinner = ora(`正在从 ${ url } 处加载API文件`).start()

    axios.get(`${ url }/teamWorkApi/v2/api-docs`)
      .then(({ data: swagger }) => {
        spinner.text = '正在处理数据'

        for (const pathsKey in swagger.paths) {
          const path = swagger.paths[pathsKey]

          for (const pathKey in path) {
            path[pathKey].operationId = path[pathKey].operationId.replace(/Using(GET|POST)_?\d?/, '')
            path[pathKey].operationId = path[pathKey].operationId.replace(/_\d/, '')
          }
        }

        spinner.text = '数据写入中...'
        const swaggerBuffer = Buffer.from(JSON.stringify(swagger))

        fs.writeFile('swagger.json', swaggerBuffer, err => {
          spinner.stop()
          if (err) {
            process.stdout.write(chalk.red('写入文件失败'))
            process.exit(1)
          }
        })
      })
      .catch(error => {
        spinner.stop()
        console.log(error)
        process.stdout.write(chalk.red('接口文件获取失败'))

        process.exit(1)
      })
  }
}

export default module

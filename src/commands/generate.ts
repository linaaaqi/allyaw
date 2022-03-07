import axios from 'axios'
import chalk from 'chalk'
import * as fs from 'fs'
import { Arguments } from 'yargs'

type Options = {
  config?: string | undefined
}

const module = {
  command: 'generate',
  desc: '生成API接口文件',
  builder: (yargs) =>
    yargs
      .options({
        config: {
          alias: 'c',
          describe: '编译配置文件',
          type: 'string'
        }
      }),
  handler: async (argv: Arguments<Options>): Promise<void> => {
    axios.get('https://osstest.tf56.com/teamWorkApi/v2/api-docs')
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
            process.stdout.write(chalk.red('写入文件失败'))
          }
        })
      })
      .catch(error => {
        console.log(error)
        process.stdout.write(chalk.red('接口文件获取失败'))

        process.exit(1)
      })
  }
}

export default module

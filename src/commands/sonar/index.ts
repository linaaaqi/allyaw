import type { Arguments } from 'yargs';
import { HandlerFactory } from './handlers/HandlerFactory.js'
import { getTaskId } from './services.js'

type Options = {
  text: string
  alert?: boolean
  type?: 'template' | 'simple'
}

export const projectName = process.env.CI_PROJECT_NAME ?? '默认'
export const projectUrl = process.env.CI_PROJECT_URL
export const userName = process.env.GITLAB_USER_NAME
export const userEmail = process.env.GITLAB_USER_EMAIL
export const commitSha = process.env.CI_COMMIT_SHA
export const commitTitle = process.env.CI_COMMIT_TITLE

const builder = (yargs) =>
  yargs
    .options({
      alert: {
        describe: '是否发送消息',
        type: 'boolean'
      }
    })
    .options({
      type: {
        describe: '消息模版类型',
        type: 'string'
      }
    })
    .positional('text', {
      type: 'string',
      demandOption: true
    })

const handler = (argv: Arguments<Options>) => {
  const { alert, text, type } = argv

  const regex = /\/api\/ce\/task\?id=.*/

  if (!regex.test(text)) {
    process.exit(1)
  }

  const urls = regex.exec(text)
  const url = urls?.[0] as string

  const handlerFactory = new HandlerFactory(type)
  const handler = handlerFactory.factory

  getTaskId(url)
    .then(id => {
      return handler.fetch(id)
    })
    .then(res => {
      handler.handle(res, alert)
    })
    .catch(err => {
      console.error('err', err)
      console.error('err.response', err.response)
    })
}

const module = {
  command: 'sonar <text>',
  desc: '使用<text>作为sonar日志输入',
  builder,
  handler
}

export default module

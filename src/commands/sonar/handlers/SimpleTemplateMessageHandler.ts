import { request } from '../../../utils/util.js'
import { projectName } from '../index.js'
import { getIssues } from '../services.js'
import { IHandler } from './IHandler'

export class SimpleTemplateMessageHandler implements IHandler {
  /**
   * 数据处理逻辑
   *
   * @param res
   * @param alert
   */
  async handle (res, alert = true): Promise<void> {
    console.log(projectName)
    const types = res?.[0]?.values
    console.log(types)
    const bugs = types.find(item => item.val === 'BUG')?.count

    if (!bugs) {
      return Promise.reject('BUG数为零')
    }

    return this.sendMentionMessage(bugs, alert)
  }

  /**
   * 获取数据
   *
   * @param id
   */
  fetch (id: string): Promise<any> | undefined {
    return getIssues();
  }

  /**
   * 发送企业微信消息
   *
   * @param bugs
   * @param alert
   */
  sendMentionMessage = async (bugs: number, alert: boolean) => {
    if (!alert) {
      return Promise.reject('Alert配置不提示消息')
    }

    const webhook = process.env.QYWECHAT_WEBHOOK
    const mentionIds = process.env.QYWECHAT_MENTION_IDS

    if (!webhook || !mentionIds) {
      return Promise.reject('Webhook或者MentionIds未配置')
    }

    const sonarQubeWebBaseUrl = 'http://10.77.32.78:9000'
    const sonarQubeWebDashboardUrl = sonarQubeWebBaseUrl + '/dashboard?id=' + projectName

    const message = {
      "msgtype": "template_card",
      "template_card": {
        "card_type": "text_notice",
        "source": {
          "icon_url": "http://10.77.32.78:9000/apple-touch-icon.png",
          "desc": "SonarQube",
          "desc_color": 0
        },
        "main_title": {
          "title": `${ projectName }项目检测结果`
        },
        "emphasis_content": {
          "title": bugs,
          "desc": "新增BUG数"
        },
        "card_action": {
          "type": 1,
          "url": sonarQubeWebDashboardUrl
        }
      }
    }

    console.log(JSON.stringify(message))

    const response = await request.post(webhook, message)

    console.log('response.data', response.data)
  }
}

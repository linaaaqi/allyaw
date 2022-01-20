import { request } from '../../../utils/util.js'
import { commitSha, commitTitle, projectName, projectUrl, userEmail, userName } from '../index.js'
import { getComponentMeasures } from '../services.js'
import { IHandler } from './IHandler'

export class TemplateMessageHandler implements IHandler {
  /**
   * 数据处理逻辑
   *
   * @param res
   * @param alert
   */
  handle (res, alert = true) {
    console.log('measures', res)

    let measures = {}
    res.forEach(item => {
      measures[item.metric] = item
    })

    const bugs = measures['new_bugs']?.periods?.[0]?.value

    /**
     * 零BUG数不提醒
     */
    if (!bugs || bugs === '0') {
      return
    }

    return Promise.all([
      this.sendMessage(measures, alert),
      this.sendMentionMessage(alert)
    ])
  }

  /**
   * 获取数据
   *
   * @param id
   */
  public fetch (id: string) {
    return getComponentMeasures(id);
  }

  /**
   * 发送企业微信消息
   *
   * @param alert
   */
  sendMentionMessage = async (alert: boolean) => {
    if (!alert) {
      return Promise.reject('Alert配置不提示消息')
    }

    const webhook = process.env.QYWECHAT_WEBHOOK
    const mentionIds = process.env.QYWECHAT_MENTION_IDS

    if (!webhook || !mentionIds) {
      return
    }

    const message = {
      "msgtype": "text",
      "text": {
        "content": `请及时处理！`,
        "mentioned_list": mentionIds.split(',')
      }
    }

    const response = await request.post(webhook, message)

    console.log('response.data', response.data)
  }

  /**
   * 发送企业微信消息
   *
   * @param measures
   * @param alert
   */
  sendMessage = async (measures, alert: boolean) => {
    if (!alert) {
      return Promise.reject('Alert配置不提示消息')
    }

    const webhook = process.env.QYWECHAT_WEBHOOK

    const sonarQubeWebBaseUrl = 'http://10.77.32.78:9000'
    const sonarQubeWebDashboardUrl = sonarQubeWebBaseUrl + '/dashboard?id=' + projectName
    const sonarQubeWebMeasuresUrl = sonarQubeWebBaseUrl + '/component_measures?id=' + projectName
    const gitlabWebUrl = projectUrl + '/pipelines'

    if (!webhook) {
      return
    }

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
          "title": measures['new_bugs']?.periods?.[0]?.value,
          "desc": "新增BUG数"
        },
        "quote_area": {
          "type": 1,
          "url": `${ projectUrl }/commit/${ commitSha }`,
          "title": 'Commit 信息',
          "quote_text": `信息: ${ commitTitle }\n作者: ${ userName } \n邮箱: ${ userEmail }`
        },
        "sub_title_text": "指标",
        "horizontal_content_list": [
          {
            "keyname": "新增BUG数",
            "value": measures['new_bugs']?.periods?.[0]?.value,
            "type": 1,
            "url": `${ sonarQubeWebMeasuresUrl }&metric=new_bugs`
          },
          {
            "keyname": "总BUG数",
            "value": measures['bugs']?.value,
            "type": 1,
            "url": `${ sonarQubeWebMeasuresUrl }&metric=bugs`
          },
          {
            "keyname": "新代码重复率",
            "value": Number(measures['new_duplicated_lines_density']?.periods?.[0]?.value ?? 0)?.toFixed(2) + '%',
            "type": 1,
            "url": `${ sonarQubeWebMeasuresUrl }&metric=new_duplicated_lines_density`
          },
          {
            "keyname": "总代码重复率",
            "value": Number(measures['duplicated_lines_density']?.value ?? 0)?.toFixed(2) + '%',
            "type": 1,
            "url": `${ sonarQubeWebMeasuresUrl }&metric=duplicated_lines_density`
          }
        ],
        "jump_list": [
          {
            "type": 1,
            "url": sonarQubeWebDashboardUrl,
            "title": "SonarQube"
          },
          {
            "type": 1,
            "url": gitlabWebUrl,
            "title": "Gitlab Pipelines"
          }
        ],
        "card_action": {
          "type": 1,
          "url": sonarQubeWebDashboardUrl
        }
      }
    }

    const response = await request.post(webhook, message)

    console.log('response.data', response.data)
  }
}

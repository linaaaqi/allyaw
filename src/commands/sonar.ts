import type { Arguments } from 'yargs';
import { request } from '../utils/util.js'

type Options = {
  text: string
  alert?: boolean
}

const projectName = process.env.CI_PROJECT_NAME ?? '默认'
const projectUrl = process.env.CI_PROJECT_URL
const userName = process.env.GITLAB_USER_NAME
const userEmail = process.env.GITLAB_USER_EMAIL
const commitSha = process.env.CI_COMMIT_SHA
const commitTitle = process.env.CI_COMMIT_TITLE

const builder = (yargs) =>
  yargs
    .options({
      alert: {
        describe: '是否发送消息',
        type: 'boolean'
      }
    })
    .positional('text', {
      type: 'string',
      demandOption: true
    })

const handler = (argv: Arguments<Options>) => {
  const { alert, text } = argv

  const regex = /\/api\/ce\/task\?id=.*/

  if (!regex.test(text)) {
    process.exit(1)
  }

  const urls = regex.exec(text)
  const url = urls?.[0] as string

  getTaskId(url)
    .then(id => {
      return getComponentMeasures(id)
    })
    .then(res => {
      console.log('measures', res)

      let measures = {}
      res.forEach(item => {
        measures[item.metric] = item
      })

      /**
       * 零BUG数不提醒
       */
      if (!measures['new_bugs']?.periods?.[0]?.value) {
        return
      }

      return Promise.all([
        sendMessage(measures),
        sendMentionMessage()
      ])
    })
    .catch(err => {
      console.error('err', err)
      console.error('err.response', err.response)
    })
}

const sendMentionMessage = async () => {
  const webhook = process.env.QYWECHAT_WEBHOOK
  const mentionIds = process.env.QYWECHAT_MENTION_IDS

  if (!webhook || !mentionIds) {
    process.exit(1)
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

const sendMessage = async (measures) => {
  const webhook = process.env.QYWECHAT_WEBHOOK

  const sonarQubeWebBaseUrl = 'http://10.77.32.78:9000'
  const sonarQubeWebDashboardUrl = sonarQubeWebBaseUrl + '/dashboard?id=' + projectName
  const sonarQubeWebMeasuresUrl = sonarQubeWebBaseUrl + '/component_measures?id=' + projectName
  const gitlabWebUrl = projectUrl + '/pipelines'

  if (!webhook) {
    process.exit(1)
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
          "value": measures['new_duplicated_lines_density']?.periods?.[0]?.value ?? 0 + '%',
          "type": 1,
          "url": `${ sonarQubeWebMeasuresUrl }&metric=new_duplicated_lines_density`
        },
        {
          "keyname": "总代码重复率",
          "value": measures['duplicated_lines_density']?.value + '%',
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

const getTaskId = async (url) => {
  const { data } = await request.get(url);
  const status = data?.task?.status;
  let analysisId = data?.task?.analysisId

  if (status !== 'SUCCESS') {
    console.log('status', status)

    await new Promise(resolve => setTimeout(resolve, 1000))
    const result = await getTaskId(url)

    if (result) {
      analysisId = result
    }
  } else {
    console.log('analysisId', analysisId)
  }

  return analysisId
}

const getComponentMeasures = async (id) => {
  console.log('id', id)

  const metricKeys = [
    'new_bugs',
    'new_reliability_rating',
    'bugs',
    'reliability_rating',
    'new_duplicated_lines_density',
    'new_duplicated_lines',
    'new_duplicated_blocks',
    'duplicated_lines_density',
    'duplicated_lines',
    'duplicated_blocks',
    'duplicated_files'
  ].join(',')

  console.log('metricKeys', metricKeys)

  return request.get('/api/measures/component', {
    params: {
      componentKey: projectName,
      metricKeys,
      additionalFields: 'metrics'
    }
  }).then(({ data }) => data.component.measures)
}

const module = {
  command: 'sonar <text>',
  desc: '使用<text>作为sonar日志输入',
  builder,
  handler
}

export default module

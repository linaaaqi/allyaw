import { request } from '../../utils/util.js'
import { projectName } from './index.js'

/**
 * 获取任务ID
 *
 * @param url
 */
export const getTaskId = async (url) => {
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

/**
 * 获取指标数据
 *
 * @param id
 */
export const getComponentMeasures = async (id) => {
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

export const getIssues = async () => {
  return request.get('/api/issues/search', {
    params: {
      componentKeys: projectName,
      ps: 1,
      resolved: 'false',
      types: 'BUG',
      severities: 'BLOCKER',
      facets: 'types'
    }
  }).then(({ data }) => data.facets)
}

import axios from 'axios'

/**
 * 字符串分割为数组的方法
 *
 * @param value
 */
export function strToArr (value: string) {
  return value.split(',')
}

/**
 * sonar api request 实例
 */
export const request = axios.create({
  baseURL: 'http://10.77.32.78:9000',
  timeout: 5000
})


/**
 * 等待函数
 * @param second
 */
export function wait (second) {
  // execSync 属于同步方法；异步方式请根据需要自行查询 node.js 的 child_process 相关方法；
  let ChildProcess_ExecSync = require('child_process').execSync;
  ChildProcess_ExecSync('sleep ' + second);
}

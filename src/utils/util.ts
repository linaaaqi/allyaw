import axios from 'axios'

/**
 * sonar api request 实例
 */
export const request = axios.create({
  baseURL: 'http://10.77.32.78:9000',
  timeout: 5000
})

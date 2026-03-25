import axios from 'axios'
import { ExtendableError } from '@/utils/error'

export class RequestError extends ExtendableError {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

const resource = axios.create({
  baseURL: '/api/'
})

export default resource

export function request(...args) {
  return resource.request(...args)
}

export async function get(url, { params, ip } = {}) {
  try {
    let response = await resource.get(url, {
      params,
      ...(ip ? { headers: { 'X-Forwarded-For': ip } } : {})
    })
    return response.data
  } catch (err) {
    if (err.response) {
      throw new RequestError(err.response.statusText, err.response.status)
    }
    throw new RequestError(err.message, 0)
  }
}

export async function post(url, data, { ip } = {}) {
  try {
    let response = await resource.post(url, data, {
      ...(ip ? { headers: { 'X-Forwarded-For': ip } } : {})
    })
    return response.data
  } catch (err) {
    if (err.response) {
      throw new RequestError(err.response.statusText, err.response.status)
    }
    throw new RequestError(err.message, 0)
  }
}

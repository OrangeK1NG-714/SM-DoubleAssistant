// import type { IActivityList } from './types/userAction'
import { http } from '@/utils/http'

const localhost = 'http://127.0.0.1:7001'

interface IActivityList {
  _id: string
  name: string
  description: string
  startTime: string
  endTime: string
}

/**
 * 获取活动列表
 */
export function getActivityList() {
  return http.get<IActivityList>(`${localhost}/api/admin/getActivityList`)
}

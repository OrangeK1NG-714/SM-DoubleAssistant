// import type { IActivityList } from './types/userAction'
import { http } from '@/utils/http'

const localhost = 'http://127.0.0.1:7001'

interface IActivityList {
  _id: string
  name: string
  description: string
  startTime: string
  endTime: string
  firstChooseStartDate: string
  firstChooseEndDate: string
  secondChooseStartDate: string
  secondChooseEndDate: string
  thirdChooseStartDate: string
  thirdChooseEndDate: string
  stdChooseStartDate: string
  stdChooseEndDate: string
}

interface IChooseCount {
  _id: string
  studentId: string
  teacherId: string
  activityId: string
  order: string
  isChose: boolean
}
/**
 * 获取活动列表
 */
export function getActivityList() {
  return http.get<IActivityList>(`${localhost}/api/admin/getActivityList`)
}

/**
 * 查询已选学生(通过老师id)
 */
export function getChooseCount(teacherId: string, activityId: string) {
  return http.get<IChooseCount>(`${localhost}/api/user/getChooseCount`, {
    teacherId,
    activityId,
  })
}
/**
 * 查询某一活动详情
 */
export function getActivityDetail(id: string) {
  return http.get<IActivityList>(`${localhost}/api/admin/getActivityDetail`, {
    id,
  })
}

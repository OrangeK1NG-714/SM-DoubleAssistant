import { getEnvBaseUrl } from '@/utils'
import { http } from '@/utils/http'

const localhost = getEnvBaseUrl()

interface ITeacherList {
  _id: string
  name: string
  teacherId: string
  msg: string
}

/**
 * 查询所有老师信息
 */
export function getTeacherList() {
  return http.get<ITeacherList>(`${localhost}/api/teacher/detail`, undefined, undefined, { requireAuth: true })
}

interface ISelectStd {
  studentId?: string
  teacherId?: string
  activityId?: string
  data?: object
  order?: number
}
export function getSelectState(data: ISelectStd) {
  return http.get(`${localhost}/api/teacher/getSelectList`, data, undefined, { requireAuth: true })
}

interface ITeacherListInActivity {
  _id: string
  activityId: string
  teacherId: string
}
/**
 * 查询某老师是否在活动中
 */
export function isTeacherInActivity(activityId: string, teacherId: string) {
  return http.get<ITeacherListInActivity>(`${localhost}/api/teacher/isInActivity`, {
    activityId,
    teacherId,
  }, undefined, { requireAuth: true })
}
/**
 * 聚合查询：老师选择页面一次性获取所有数据（学生列表+最大选择数+活动详情）
 */
export function getChoosePageData(teacherId: string, activityId: string) {
  return http.get(`${localhost}/api/teacher/getChoosePageData`, {
    teacherId,
    activityId,
  }, undefined, { requireAuth: true })
}

/**
 * 老师选学生（Final+Choose一步完成）
 */
export function selectStudentAndUpdate(data: ISelectStd) {
  return http.post(`${localhost}/api/teacher/selectStudentAndUpdate`, data, undefined, undefined, { requireAuth: true })
}

/**
 * 老师取消选学生（Final+Choose一步完成）
 */
export function cancelSelectAndUpdate(data: ISelectStd) {
  return http.post(`${localhost}/api/teacher/cancelSelectAndUpdate`, data, undefined, undefined, { requireAuth: true })
}

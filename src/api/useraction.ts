// import type { IActivityList } from './types/userAction'
import { getEnvBaseUrl } from '@/utils'
import { http } from '@/utils/http'

const localhost = getEnvBaseUrl()

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
  createTime: Date
}
/**
 * 获取活动列表
 */
export function getActivityList() {
  return http.get<IActivityList>(`${localhost}/api/admin/getActivityList`, undefined, undefined, { requireAuth: true })
}

/**
 * 获取当前用户参与的所有活动（由JWT自动识别用户）
 */
export function getMyActivities() {
  return http.get<IActivityList[]>(`${localhost}/api/user/getMyActivities`, undefined, undefined, { requireAuth: true })
}

/**
 * 查询已选学生(通过老师id)
 */
export function getChooseCount(teacherId: string, activityId: string) {
  return http.get<IChooseCount>(`${localhost}/api/user/getChooseCount`, {
    teacherId,
    activityId,
  }, undefined, { requireAuth: true })
}
/**
 * 查询某一活动详情
 */
export function getActivityDetail(id: string) {
  return http.get<IActivityList>(`${localhost}/api/admin/getActivityDetail`, {
    id,
  }, undefined, { requireAuth: true })
}
/**
 * 查询一个学生的选择情况(根据活动id+学生id)
 */
export function getChooseCountWithActivityId(activityId: string, studentId: string) {
  return http.get<IChooseCount>(`${localhost}/api/user/getChooseDetail`, {
    activityId,
    studentId,
  }, undefined, { requireAuth: true })
}

/**
 * 查询用户信息(查询某一人信息)
 */
export function getUserDetail(username: string, role: string) {
  return http.get(`${localhost}/api/user/detail`, {
    username,
    role,
  }, undefined, { requireAuth: true })
}

/**
 * 查询老师在某活动中的最大学生选择数（复用这个路由）
 */
export function getMaxChooseNum(activityId: string, teacherId: string) {
  return http.get(`${localhost}/api/user/getMaxSelectNum`, {
    activityId,
    teacherId,
  }, undefined, { requireAuth: true })
}

/**
 * 获取导师简历图片
 */
export function getTeacherResume(teacherId: string) {
  return uni.downloadFile({
    url: `${localhost}/api/teacher/getTeacherResume?teacherId=${teacherId}`,
  })
}

// import type { IActivityList } from './types/userAction'
import { getEnvBaseUrl } from '@/utils'
import { http } from '@/utils/http'

const localhost = getEnvBaseUrl()
interface ITeacherListInActivity {
  _id: string
  activityId: string
  teacherId: string
}

interface IStudentListInActivity {
  _id: string
  activityId: string
  studentId: string
}
/**
 * 新增选老师的参数
 */
interface ISelectTeacher {
  activityId: string
  teacherId: string
  order: number
  isChose: boolean
  studentId: string
  createTime: string
  subscribeTemplateId?: string
  subscribeStatus?: string
}

/**
 * 查询某个活动中老师列表信息
 */
export function getTeacherListInActivity(activityId: string) {
  return http.get<ITeacherListInActivity>(`${localhost}/api/student/getTeacherList`, {
    activityId,
  }, undefined, { requireAuth: true })
}

interface ITeacherForActivity {
  teacherId: string
  name: string
  msg: string
  teacherType: string
  maxSelectNum: number
  chooseCount: number
  selectedCount: number
}
/**
 * 查询某活动中老师完整信息（详情+选择计数，聚合接口）
 */
export function getTeachersForActivity(activityId: string) {
  return http.get<ITeacherForActivity[]>(`${localhost}/api/student/getTeachersForActivity`, {
    activityId,
  }, undefined, { requireAuth: true })
}
/**
 * 查询某学生是否在活动中
 */
export function isStudentInActivity(activityId: string, studentId: string) {
  return http.get<IStudentListInActivity>(`${localhost}/api/student/isInActivity`, {
    activityId,
    studentId,
  }, undefined, { requireAuth: true })
}
/**
 * 新增学生选老师选项
 */
export function selectTeacher(data: ISelectTeacher) {
  return http.post(`${localhost}/api/student/selectTeacher`, data, undefined, undefined, { requireAuth: true })
}

interface IWriteStdInfo {
  name: string
  gender: string
  studentId: string
  grade: string
  classNum: string
  phone: string
  qq?: string
  wechat?: string
  gpa: string
  direction: string
  resumeName?: string
}
/**
 * 写入学生信息
 */
export function writeStdInfo(data: IWriteStdInfo) {
  return http.post(`${localhost}/api/user/writeMsg`, data, undefined, undefined, { requireAuth: true })
}

interface StudentData {
  name: string
  gender: string
  studentId: string
  grade: string
  classNum: string
  phone: string
  gpa: string
  direction: string
}

interface IStdInfo {
  _id: string
  studentId: string
  mentor: string
  data: StudentData
}
/**
 * 查询学生信息
 */
export function getStudentMsg(studentId: string) {
  return http.get<IStdInfo>(`${localhost}/api/student/getMsg`, {
    studentId,
  }, undefined, { requireAuth: true })
}

interface ISelfResetPassword {
  username: string
  oldPassword: string
  newPassword: string
}
/**
 *  用户自助修改密码（无需登录token，需验证旧密码）
 */
export function selfResetPassword(data: ISelfResetPassword) {
  return http.post(`${localhost}/api/user/selfResetPassword`, data)
}

/**
 * 上报学生微信 openid（传入 wx.login 返回的 code，后端换取并保存）
 */
export function saveOpenid(code: string, studentId: string) {
  return http.post(`${localhost}/api/student/saveOpenid`, { code, studentId }, undefined, undefined, { requireAuth: true })
}

/**
 * 查询学生的最终志愿
 */
export function getStudentFinalChoice(studentId: string, activityId: string) {
  return http.get(`${localhost}/api/admin/getFinalChoose`, {
    studentId,
    activityId,
  }, undefined, { requireAuth: true })
}

/**
 * AI 推荐导师响应项
 */
export interface IRecommendTeacherItem {
  teacherId: string
  name: string
  matchScore: number
  slot: string
  reason: string
}

/**
 * AI 推荐导师
 */
export function getRecommendTeachers(activityId: string, studentId: string) {
  return http.get<IRecommendTeacherItem[]>(`${localhost}/api/student/recommendTeachers`, {
    activityId,
    studentId,
  }, undefined, { requireAuth: true })
}

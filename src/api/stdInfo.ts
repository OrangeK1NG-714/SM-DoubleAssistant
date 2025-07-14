// import type { IActivityList } from './types/userAction'
import { http } from '@/utils/http'

const localhost = 'http://127.0.0.1:7001'

interface ITeacherListInActivity {
  _id: string
  activityId: string
  teacherId: string
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
}

/**
 * 查询某个活动中老师列表信息
 */
export function getTeacherListInActivity(activityId: string) {
  return http.get<ITeacherListInActivity>(`${localhost}/api/student/getTeacherList`, {
    activityId,
  })
}

/**
 * 新增学生选老师选项
 */
export function selectTeacher(data: ISelectTeacher) {
  return http.post(`${localhost}/api/student/selectTeacher`, data)
}

interface IWriteStdInfo {
  name: string
  gender: string
  studentId: string
  grade: string
  classNum: string
  phone: string
  gpa: string
  direction: string
  // resumeName: '',
}
/**
 * 写入学生信息
 */
export function writeStdInfo(data: IWriteStdInfo) {
  return http.post(`${localhost}/api/user/writeMsg`, data)
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
  })
}

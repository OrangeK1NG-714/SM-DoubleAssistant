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
  createTime: number
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

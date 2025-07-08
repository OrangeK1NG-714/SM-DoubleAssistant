// import type { IActivityList } from './types/userAction'
import { http } from '@/utils/http'

const localhost = 'http://127.0.0.1:7001'

interface ITeacherList {
  _id: string
  name: string
  teacherId: string
  msg: string
}

/**
 * 查询老师信息
 */
export function getTeacherList() {
  return http.get<ITeacherList>(`${localhost}/api/teacher/detail`)
}



import { getEnvBaseUrl } from '@/utils'
import { getAuthorizedAccessToken } from '@/utils/http'

export async function uploadStudentResume(input: {
  tempFilePath: string
  fileName: string
  studentId: string
}): Promise<void> {
  const accessToken = await getAuthorizedAccessToken()
  await new Promise<void>((resolve, reject) => {
    uni.uploadFile({
      url: `${getEnvBaseUrl()}/api/student/uploadResume`,
      filePath: input.tempFilePath,
      name: 'file',
      header: { Authorization: `Bearer ${accessToken}` },
      formData: {
        fileName: input.fileName,
        studentId: input.studentId,
      },
      success(response) {
        if (response.statusCode === 200) {
          resolve()
        }
        else {
          reject(new Error(`resume upload failed: ${response.statusCode}`))
        }
      },
      fail: reject,
    })
  })
}

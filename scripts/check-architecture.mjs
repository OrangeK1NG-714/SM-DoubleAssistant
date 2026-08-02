import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve(import.meta.dirname, '..')
const errors = []
const architecture = readFileSync(path.join(root, 'ARCHITECTURE.md'), 'utf8')
for (const heading of [
  '## 产品与边界',
  '## 目录职责',
  '## 依赖方向',
  '## 禁止事项',
  '## 当前迁移热点',
  '## 验证',
]) {
  if (!architecture.includes(heading))
    errors.push(`ARCHITECTURE.md missing ${heading}`)
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}

for (const file of walk(path.join(root, 'src'))) {
  if (!/\.(?:ts|vue)$/u.test(file))
    continue
  const relative = path.relative(root, file).split(path.sep).join('/')
  const source = readFileSync(file, 'utf8')
  if (
    relative !== 'src/adapters/auth/uni-auth-session.ts'
    && /uni\.(?:get|set|remove)StorageSync\(\s*['"](?:accessToken|refreshToken|accessTokenExpiresAt|token)['"]/u.test(source)
  ) {
    errors.push(`${relative}: token storage bypasses the auth adapter`)
  }
  if (
    /src\/(?:application|domain)\//u.test(relative)
    && /from\s+['"](?:vue|pinia|@dcloudio|mongoose|express)/u.test(source)
  ) {
    errors.push(`${relative}: inner layer imports a framework`)
  }
  if (
    source.includes('uni.uploadFile(')
    && relative !== 'src/adapters/http/authenticated-upload.ts'
  ) {
    errors.push(`${relative}: uploadFile bypasses the authenticated adapter`)
  }
}

const uploadAdapter = readFileSync(
  path.join(root, 'src/adapters/http/authenticated-upload.ts'),
  'utf8',
)
if (!uploadAdapter.includes('getAuthorizedAccessToken') || !uploadAdapter.includes('Authorization'))
  errors.push('authenticated upload adapter must attach the shared auth token')

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('SM architecture check passed')

const fs = require('node:fs')
const path = require('node:path')

const outputDirectory = path.resolve(__dirname, '../dist/build/mp-weixin')
const privateConfigPath = path.join(outputDirectory, 'project.private.config.json')
const outputPath = path.join(outputDirectory, 'app.wxss')
const remoteShadow = 'url(https://cdn1.dcloud.net.cn/524446464e5441774d53556c643367795a575933595463354f44426a4e54686b4d6a5577/img/shadow-grey.png)'

if (fs.existsSync(privateConfigPath)) {
  const privateConfigStat = fs.lstatSync(privateConfigPath)
  if (!privateConfigStat.isFile() || privateConfigStat.isSymbolicLink()) {
    throw new Error('refusing to remove an unexpected project.private.config.json entry')
  }
  fs.unlinkSync(privateConfigPath)
  console.log('Removed project.private.config.json from the release artifact')
}

const source = fs.readFileSync(outputPath, 'utf8')
const occurrences = source.split(remoteShadow).length - 1

if (occurrences !== 0 && occurrences !== 4) {
  throw new Error(`unexpected UniApp shadow preload count: ${occurrences}`)
}

if (occurrences === 4) {
  fs.writeFileSync(outputPath, source.replaceAll(remoteShadow, 'none'))
}
console.log(occurrences === 4
  ? 'Removed the external UniApp shadow preload from app.wxss'
  : 'No external UniApp shadow preload found in app.wxss')

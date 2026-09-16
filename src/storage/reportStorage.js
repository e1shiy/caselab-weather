import { mkdir, readFile, writeFile } from 'node:fs/promises'

const reportsDir = process.env.REPORTS_PATH || './reports'

const todayStr = () => new Date().toISOString().slice(0, 10)
const reportFilePath = cityName => `${reportsDir}/${cityName}-${todayStr()}.json`

export const readCachedReport = async (cityName, days) => {
  try {
    const raw = await readFile(reportFilePath(cityName), 'utf-8')
    const report = JSON.parse(raw)
    const { days: forecastDays } = report
    
    if (forecastDays.length > days) {
      return { ...report, days: forecastDays.slice(0, days) }
    } else if (forecastDays.length === days) {
      return report
    } else {
      return null
    }
  } catch {
    return null
  }
}

export const saveReport = async (cityName, data) => {
  await mkdir(reportsDir, { recursive: true })
  await writeFile(reportFilePath(cityName), JSON.stringify(data, null, 2), 'utf-8')
}

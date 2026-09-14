import { getGeocoding } from '../api/geocoding.js'
import { getForecast } from '../api/forecast.js'

export const getForecastByCities = async (cityNames, days = 3, options = {}) => {
  const ok = []
  const errors = []

  const promises = cityNames.map(name => getForecastByCity(name, days, options))
  const results = await Promise.allSettled(promises)

  results.forEach((res, i) => {
    if (res.status === 'fulfilled') {
      ok.push(res.value)
    } else {
      errors.push({ cityName: cityNames[i], reason: res.reason.message })
    }
  })

  return { ok, errors }
}

const getForecastByCity = async (cityName, days, { noCache = false, readCache, saveReport } = {}) => {
  const trimmedName = cityName.trim()
  if (!trimmedName) throw new Error('Название города не должно быть пустым')

  if (!noCache && readCache) {
    const cached = await readCache(trimmedName)
    if (cached) return cached
  }

  const geoResults = await getGeocoding(trimmedName)
  const [geo] = geoResults
  const { name: city, country, latitude, longitude } = geo

  const { daily } = await getForecast(latitude, longitude, days)
  const forecastDays = daily.time.map((time, index) => ({
    day: time,
    tempMax: daily.temperature_2m_max[index],
    tempMin: daily.temperature_2m_min[index],
    precipitationSum: daily.precipitation_sum[index]
  }))

  const report = { city, country, latitude, longitude, days: forecastDays }

  if (saveReport) {
    await saveReport(trimmedName, report)
  }

  return report
}

export const formatDigest = ({ ok, errors }) => {
  const parts = []

  for (const city of ok) {
    parts.push(formatCity(city))
  }

  if (errors.length > 0) {
    parts.push(formatErrors(errors))
  }

  if (parts.length === 0) {
    return 'Нет данных для отображения.'
  }

  return parts.join('\n\n')
}

const formatCity = ({ city, country, latitude, longitude, days }) => {
  const title = `${city}, ${country}`
  const coords = `(${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
  const header = `${title} ${coords}`
  const rows = days.map(formatDay).join('\n')
  return `${header}\n\n${rows}`
}

const formatDay = ({ day, tempMax, tempMin, precipitationSum }) => {
  const temps = `${formatTemperature(tempMax)} / ${formatTemperature(tempMin)}`
  const precipitation = `осадки: ${precipitationSum.toFixed(1)} мм`
  return `  ${day}   ${temps}   ${precipitation}`
}

const formatTemperature = value => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}°C`
}

const formatErrors = errors => {
  const lines = errors.map(({ cityName, reason }) => `  - ${cityName}: ${reason}`)
  return `Не удалось получить прогноз:\n${lines.join('\n')}`
}

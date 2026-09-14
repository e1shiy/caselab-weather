const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS) || 5000
const forecastApiUrl = process.env.FORECAST_API_URL

export const getForecast = async (latitude, longitude, days = 3) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    forecast_days: days,
    timezone: 'auto'
  })

  const controller = new AbortController()
  const { signal } = controller
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    const url = new URL(forecastApiUrl)
    url.search = params.toString()
    response = await fetch(url.toString(), { signal })
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error(`Превышено время ожидания прогноза (${timeoutMs} мс)`)
    }
    throw new Error(`Сеть недоступна при обращении к прогнозу: ${e.message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  let json
  try {
    json = await response.json()
  } catch {
    throw new Error('Некорректный JSON в ответе сервиса прогноза')
  }

  if (!response.ok) {
    const reason = json?.reason || response.statusText || 'неизвестная ошибка'
    if (response.status >= 500) {
      throw new Error(`Сервис прогноза недоступен (${response.status}): ${reason}`)
    }
    throw new Error(`Некорректный запрос прогноза (${response.status}): ${reason}`)
  }

  return json
}

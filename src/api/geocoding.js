const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS) || 5000
const geocodingApiUrl = process.env.GEOCODING_API_URL

export const getGeocoding = async name => {
  const params = new URLSearchParams({
    name,
    count: 1,
    language: 'ru',
    format: 'json'
  })

  const controller = new AbortController()
  const { signal } = controller
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    const url = new URL(geocodingApiUrl)
    url.search = params.toString()
    response = await fetch(url.toString(), { signal })
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error(`Превышено время ожидания геокодинга (${timeoutMs} мс)`)
    }
    throw new Error(`Сеть недоступна при обращении к геокодингу: ${e.message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  let json
  try {
    json = await response.json()
  } catch {
    throw new Error('Некорректный JSON в ответе сервиса геокодинга')
  }

  if (!response.ok) {
    const reason = json?.reason || response.statusText || 'неизвестная ошибка'
    if (response.status >= 500) {
      throw new Error(`Сервис геокодинга недоступен (${response.status}): ${reason}`)
    }
    throw new Error(`Некорректный запрос к геокодингу (${response.status}): ${reason}`)
  }

  const results = json.results
  if (!results || !results.length) {
    throw new Error(`Город "${name}" не найден`)
  }

  return results
}

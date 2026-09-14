import { getForecastByCities } from './services/weather.js'
import { formatDigest } from './format/terminal.js'
import { readCachedReport, saveReport } from './storage/reportStorage.js'

const parseArgs = argv => {
	const args = { city: null, days: 3, noCache: false, help: false }

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]
		switch (arg) {
			case '--city':
				args.city = argv[++i]
				break
			case '--days':
				args.days = Number(argv[++i])
				break
			case '--no-cache':
				args.noCache = true
				break
			case '--help':
			case '-h':
				args.help = true
				break
			default:
				break
		}
	}

	return args
}

const validateArgs = ({ city, days }) => {
	if (!city || !city.trim()) {
		throw new Error('Не указан обязательный параметр --city')
	}
	if (!Number.isInteger(days) || days < 1 || days > 7) {
		throw new Error('Параметр --days должен быть целым числом от 1 до 7')
	}
}

const main = async () => {
	const args = parseArgs(process.argv.slice(2))

	try {
		validateArgs(args)
	} catch (e) {
		console.error(`Ошибка: ${e.message}\n`)
		process.exitCode = 1
		return
	}

	const cityNames = args.city
		.split(',')
		.map(name => name.trim())
		.filter(Boolean)

	const { ok, errors } = await getForecastByCities(cityNames, args.days, {
		noCache: args.noCache,
		readCache: readCachedReport,
		saveReport
	})

	console.log(formatDigest({ ok, errors }))

	process.exitCode = ok.length > 0 ? 0 : 1
}

main().catch(e => {
	console.error(`Непредвиденная ошибка: ${e.message}`)
	process.exitCode = 1
})

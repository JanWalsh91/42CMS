import { Schema } from 'mongoose'
import chalk from 'chalk'

import { ILocale, ILocaleSettings } from '../interfaces'
import { Locale } from '../models'
import { jsonLocale } from '../types'

const locales: { default: jsonLocale[], all: jsonLocale[] } = require('../resources/locales.json')

const localeSettingsSchema = new Schema({
	availableLocales: {
		type: [Schema.Types.ObjectId],
		ref: 'Locale',
		default: []
	}
})

localeSettingsSchema.methods = {
	getAllLocales: (): jsonLocale[] => locales.all,
	getDefaultLocales: (): jsonLocale[] => locales.default,
	reset: async function (this: ILocaleSettings): Promise<void> {
		// console.log(chalk.red('[localSettingsSchema.reset]'))
		// reset Locale Collection
		await Locale.deleteMany({})
		let defaultLocales = this.getDefaultLocales()
		// create and save default locales
		let locales: ILocale[] = await Promise.all(defaultLocales.map(async (config: jsonLocale): Promise<ILocale> => {
			let locale: ILocale = new Locale ({
				id: config.id,
				language: config.language,
				country: config.country
			})
			await locale.save()
			return locale
		}))

		await Promise.all(defaultLocales.map(async(config: jsonLocale) => {
			if (config.fallback) {
				let locale = locales.find(x => x.id == config.id)
				let fallback: ILocale = locales.find(x => x.id == config.fallback)
				if (fallback) {
					locale.fallback = fallback
					return locale.save()
				}
			}
		}))
	}
}

export {
	localeSettingsSchema,
}
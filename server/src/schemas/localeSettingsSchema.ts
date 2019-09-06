import { Schema } from 'mongoose'
import chalk from 'chalk'

import { ILocale, ILocaleSettings } from '../interfaces'
import { Locale } from '../models'
import { jsonLocale } from '../types'
import { ValidationError } from '../utils';

const locales: { default: jsonLocale[], all: jsonLocale[] } = require('../resources/locales.json')

const localeSettingsSchema = new Schema({
	availableLocales: [{
		type: Schema.Types.ObjectId,
		ref: 'Locale',
	}]
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
		this.availableLocales = locales
		this.markModified('availableLocales')
	},
	localeIsAvailable: function (this: ILocaleSettings, id: string): boolean {
		// console.log(chalk.magenta(`[localeSettingsSchema.localeIsAvailable] ` + id))
		return this.availableLocales.some(x => x.id == id)
	},
	localeIsValid: function (this: ILocaleSettings, id: string): boolean {
		return this.getAllLocales().some(x => x.id == id)
	},
	addLocale: async function (this: ILocaleSettings, id: string): Promise<void> {
		console.log(chalk.magenta(`[localeSettingsSchema.addLocale] ` + id))
		// await this.populate('availableLocales').execPopulate()
		let config: jsonLocale = this.getAllLocales().find(x => x.id == id)
		if (!config) {
			console.log(chalk.yellow('config not found for locale ' + id))
			return 
		}
		let locale: ILocale = new Locale ({
			id: config.id,
			language: config.language,
			country: config.country
		})
		if (config.fallback) {
			let locale = this.availableLocales.find(x => x.id == config.id)
			let fallback: ILocale = this.availableLocales.find(x => x.id == config.fallback)
			if (fallback) {
				locale.fallback = fallback
			}
		}
		await locale.save()
		this.availableLocales.push(locale)
		this.markModified('availableLocales')
	},
	removeLocale: async function (this: ILocaleSettings, id: string): Promise<void> {
		console.log(chalk.magenta(`[localeSettingsSchema.removeLocale]` + id))
		// await this.populate({path: 'availableLocales', populate: {path: 'fallback'}}).execPopulate()
		if (this.availableLocales.some(x => x.fallback && x.fallback.id == id )) {
			console.log(chalk.red('Cannot remove locale it is being used as a fallback'))
			throw new ValidationError('Cannot remove locale it is being used as a fallback')
		}
		this.availableLocales = this.availableLocales.filter(x => x.id != id)
		this.markModified('availableLocales')		
	}
}

export {
	localeSettingsSchema,
}
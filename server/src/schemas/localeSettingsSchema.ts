import { Schema } from 'mongoose'
import chalk from 'chalk'

import { ILocale, ILocaleSettings } from '../interfaces'
import { Locale } from '../models'
import { jsonLocale } from '../types'
import { ValidationError } from '../utils';
import { localeService } from '../services';

// const locales: { default: jsonLocale[], all: jsonLocale[] } = require('../resources/locales.json')

const localeSettingsSchema = new Schema({
	availableLocales: [{
		type: Schema.Types.ObjectId,
		ref: 'Locale',
	}]
})

localeSettingsSchema.methods = {
	// TODO: grabs default locales which were already created in localeService
	reset: async function (this: ILocaleSettings): Promise<void> {
		// console.log(chalk.red('[localSettingsSchema.reset]'))
		
		const locales: ILocale[] = await Promise.all(
			localeService
				.getDefaultLocales()
				.map(x => x.id)
				.map(async (id: string): Promise<ILocale> => Locale.findById(id))
		)
		this.availableLocales = locales
		this.markModified('availableLocales')
	},
	localeIsAvailable: function (this: ILocaleSettings, id: string): boolean {
		// console.log(chalk.magenta(`[localeSettingsSchema.localeIsAvailable] ` + id))
		return this.availableLocales.some(x => x.id == id)
	},
	addAvailableLocale: async function (this: ILocaleSettings, id: string): Promise<void> {
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
	removeAvailableLocale: async function (this: ILocaleSettings, id: string): Promise<void> {
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
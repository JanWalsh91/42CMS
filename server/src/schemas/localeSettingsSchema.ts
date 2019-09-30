import { Schema } from 'mongoose'
import chalk from 'chalk'

import { ILocale, ILocaleSettings } from '../interfaces'
import { ValidationError } from '../utils';
import { localeService } from '../services';

const localeSettingsSchema = new Schema({
	availableLocales: [{
		type: Schema.Types.ObjectId,
		ref: 'Locale',
		autopopulate: true,
	}]
})

localeSettingsSchema.methods = {
	reset: async function (this: ILocaleSettings): Promise<void> {
		// console.log(chalk.red('[localSettingsSchema.reset]'))
		const locales: ILocale[] = await Promise.all(
			localeService
				.getDefaultLocaleConfigs()
				.map(x => x.id)
				.map(async (id: string): Promise<ILocale> => localeService.getById(id))
		)
		this.availableLocales = locales
		this.markModified('availableLocales')
	},
	localeIsAvailable: function (this: ILocaleSettings, id: string): boolean {
		// console.log(chalk.magenta(`[localeSettingsSchema.localeIsAvailable] ` + id))
		return this.availableLocales.some(x => x.id == id)
	},
	addAvailableLocale: async function (this: ILocaleSettings, locale: ILocale): Promise<void> {
		// console.log(chalk.magenta(`[localeSettingsSchema.addLocale] ${locale.id}`))
		this.availableLocales.push(locale)
	},
	removeAvailableLocale: async function (this: ILocaleSettings, locale: ILocale): Promise<void> {
		// console.log(chalk.magenta(`[localeSettingsSchema.removeLocale] ${locale.id}`))
		if (this.availableLocales.some(x => x.fallback && x.fallback.id == locale.id )) {
			throw new ValidationError('Cannot remove locale it is being used as a fallback')
		}
		this.availableLocales = this.availableLocales.filter(x => x.id != locale.id)
	}
}

localeSettingsSchema.plugin(require('mongoose-autopopulate'))

export {
	localeSettingsSchema,
}
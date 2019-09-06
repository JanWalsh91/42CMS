import chalk from 'chalk'

import { Patchable, patchAction } from '../utils'
import { ILocale } from '../interfaces'
import { Locale } from '../models'
import { jsonLocale } from '../types'

const locales: { default: jsonLocale[], all: jsonLocale[] } = require('../resources/locales.json')

export class LocaleService extends Patchable {
	patchMap = {
		fallback: {
			$set: async (action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const locale: ILocale = action.resources.locale
				await this.setFallback(locale, action.value)
			},
			$unset: async (action: patchAction): Promise<void> => {
				const locale: ILocale = action.resources.locale
				await this.setFallback(locale, 'default')
			},
		}
	}

	public async getById(id: string): Promise<ILocale> {
		return Locale.findOne({id}).exec()
	}

	private async setFallback(locale: ILocale, id: string) {
		console.log(chalk.magenta(`[LocaleService.setFallback] ${id}`))
	}

	public async init(): Promise<void> {
		await Locale.deleteMany({})
		const localeConfigs = this.getAllLocales()

		// Create and save locales
		const locales: ILocale[] = await Promise.all(localeConfigs.map(async (config: jsonLocale): Promise<ILocale> => {
			let locale: ILocale = new Locale ({
				id: config.id,
				language: config.language,
				country: config.country
			})
			await locale.save()
			return locale
		}))

		// Set locale fallbacks
		await Promise.all(localeConfigs.map(async(config: jsonLocale) => {
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

	public reset = this.init

	public getAllLocales (): jsonLocale[] {
		return locales.all
	}
	public getDefaultLocales (): jsonLocale[] {
		return locales.default
	}
	public localeIsValid (id: string): boolean {
		return this.getAllLocales().some(x => x.id == id)
	}

}

export const localeService: LocaleService = new LocaleService();
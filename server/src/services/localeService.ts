import { Patchable, patchAction, patchRequest, ValidationError, ResourceNotFoundError } from '../utils'
import { ILocale } from '../interfaces'
import { Locale } from '../models'
import { jsonLocale } from '../types'

const locales: { default: jsonLocale[], all: jsonLocale[] } = require('../resources/locales.json')

class LocaleService extends Patchable<ILocale> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	patchMap = {
		fallback: {
			$set: async (locale: ILocale, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setFallback(locale, action.value)
			},
			$unset: async (locale: ILocale, action: patchAction): Promise<void> => {
				await this.setFallback(locale, 'default')
			},
		}
	}

	public async getById(id: string): Promise<ILocale> {
		return Locale.findOne({id}).exec()
	}

	private async setFallback(locale: ILocale, id: string) {
		const fallbackLocale: ILocale = await this.getById(id)
		if (!fallbackLocale) {
			throw new ResourceNotFoundError('Locale', `${id}`)
		}
		if (fallbackLocale.id == locale.id) {
			throw new ValidationError('Invalid fallback locale')
		}
		locale.setFallback(fallbackLocale)
	}

	public async init(): Promise<void> {
		await Locale.deleteMany({})
		const localeConfigs = this.getAllLocaleConfigs()

		// Create and save locales
		const locales: ILocale[] = await Promise.all(localeConfigs.map(async (config: jsonLocale): Promise<ILocale> =>
			new Locale ({
				id: config.id,
				language: config.language,
				country: config.country
			}).save()
		))

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

	public async getAll(): Promise<ILocale[]> {
		return Locale.find({}).exec()
	}

	public async update(locale: ILocale, patchRequest: patchRequest, resources: any): Promise<ILocale> {
		await this.patch(locale, patchRequest, resources)
		return locale.save()
	}

	public getAllLocaleConfigs(): jsonLocale[] {
		return locales.all
	}
	public getDefaultLocaleConfigs(): jsonLocale[] {
		return locales.default
	}
	public localeIsValid(id: string): boolean {
		return this.getAllLocaleConfigs().some(x => x.id == id)
	}

}

export const localeService: LocaleService = new LocaleService();
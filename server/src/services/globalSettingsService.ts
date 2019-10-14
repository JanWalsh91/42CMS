import { IGlobalSettings, ILocaleSettings, ILocale } from '../interfaces'
import { GlobalSettings } from '../models'
import { Patchable, patchAction, ValidationError, patchRequest, ResourceNotFoundError } from '../utils'
import { localeService } from '.'

class GlobalSettingsService extends Patchable<IGlobalSettings> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	patchMap = {
		locale: {
			$add: async(globalSettings: IGlobalSettings, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.addLocale(globalSettings, action.value)
			},
			$remove: async(globalSettings: IGlobalSettings, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.removeLocale(globalSettings, action.value)
			}
		}
	}

	public async get(): Promise<IGlobalSettings> {
		return await GlobalSettings.findOne().populate({
			path: 'locale.availableLocales',
			populate: {
				path: 'fallback'
			}
		})
	}

	public async reset(): Promise<void> {
		let globalSettings: IGlobalSettings = await this.get()
		if (!globalSettings) {
			globalSettings = await new GlobalSettings()
			await globalSettings.save()
		}
		await globalSettings.locale.reset()
		await globalSettings.save()
	}

	/**
	 * Creates new default settings if not present in database
	 * @param force Forces the reset
	 */
	public async init(force?: boolean): Promise<void> {
		await this.reset()
	}

	public async update(globalSettings: IGlobalSettings, patchRequest: patchRequest, resources: any): Promise<void> {
		await this.patch(globalSettings, patchRequest, resources)
		await globalSettings.save()
	}

	private async addLocale(globalSettings: IGlobalSettings, value: string): Promise<void> {
		const localeSettings: ILocaleSettings = globalSettings.locale
		if (!localeSettings.localeIsAvailable(value)) {
			const locale: ILocale = await localeService.getById(value)
			if (!locale) {
				throw new ResourceNotFoundError('Locale', value)
			}
			await localeSettings.addAvailableLocale(locale)
		}
	}

	private async removeLocale(globalSettings: IGlobalSettings, value: string): Promise<void> {
		const localeSettings: ILocaleSettings = globalSettings.locale
		if (localeSettings.localeIsAvailable(value)) {
			const locale: ILocale = await localeService.getById(value)
			if (!locale) {
				throw new ResourceNotFoundError('Locale', value)
			}
			await localeSettings.removeAvailableLocale(locale)
		} else {
			throw new ValidationError('Locale not available')
		}
	}
}

export const globalSettingsService: GlobalSettingsService = new GlobalSettingsService()
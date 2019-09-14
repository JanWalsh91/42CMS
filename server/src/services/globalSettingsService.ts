import { IGlobalSettings, ILocaleSettings, ILocale } from '../interfaces'

import { GlobalSettings } from '../models'
import chalk from 'chalk'
import { Patchable, patchAction, ValidationError, patchRequest, ResourceNotFoundError } from '../utils';
import { async } from 'q';
import { localeService } from '.';

class GlobalSettingsService extends Patchable {
	patchMap = {
		locale: {
			$add: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[GlobalSettingsService.locale.$add]'))
				this.checkRequiredProperties(action, ['value'])
				await this.addLocale(action.resources.globalSettings, action.value)
			},
			$remove: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[GlobalSettingsService.locale.$remove]'))
				this.checkRequiredProperties(action, ['value'])
				await this.removeLocale(action.resources.globalSettings, action.value)
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
		console.log(chalk.magenta('[GlobalSettingsService.reset]'))
		
		let globalSettings: IGlobalSettings = await this.get()
		if (!globalSettings) {
			globalSettings = await new GlobalSettings()
			await globalSettings.save()
		}
		await globalSettings.locale.reset()
		await globalSettings.save()
		console.log(chalk.magenta('[GlobalSettingsService.reset] -- end'))
	}

	/**
	 * Creates new default settings if not present in database
	 * @param force Forces the reset
	 */
	public async init(force?: boolean): Promise<void> {
		console.log(chalk.magenta('[GlobalSettingsService.init]'))
		await this.reset()
	}

	public async update(globalSettings: IGlobalSettings, patchRequest: patchRequest, resources: any): Promise<void> {
		console.log(chalk.magenta(`[GlobalSettingsService.update]`))

		await this.patch(patchRequest, resources)

		await globalSettings.save()
	}

	private async addLocale(globalSettings: IGlobalSettings, value: string): Promise<void> {
		console.log(chalk.magenta(`[GlobalSettingsService.addLocale]`))
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
		console.log(chalk.magenta(`[GlobalSettingsService.removeLocale]`))
		const localeSettings: ILocaleSettings = globalSettings.locale
		if (localeSettings.localeIsAvailable(value)) {
			const locale: ILocale = await localeService.getById(value)
			if (!locale) {
				throw new ResourceNotFoundError('Locale', value)
			}
			await localeSettings.removeAvailableLocale(locale)
		}
	}
}

export const globalSettingsService: GlobalSettingsService = new GlobalSettingsService()
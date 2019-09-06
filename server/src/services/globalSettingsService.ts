import { IGlobalSettings } from '../interfaces'

import { GlobalSettings } from '../models'
import chalk from 'chalk'
import { Patchable } from '../utils';

class GlobalSettingsService extends Patchable {
	patchMap = {
		
	}

	public async get(): Promise<IGlobalSettings> {
		return GlobalSettings.findOne()
	}

	public async reset(): Promise<void> {
		console.log(chalk.magenta('[globalSettingsService.reset]'))
		
		let globalSettings: IGlobalSettings = await this.get()
		if (!globalSettings) {
			console.log('create new global settings')
			globalSettings = await new GlobalSettings()
			await globalSettings.save()
		}
		console.log('globalSettings:', globalSettings)
		await globalSettings.locale.reset()
	}

	/**
	 * Creates new default settings if not present in database
	 * @param force Forces the reset
	 */
	public async init(force?: boolean): Promise<void> {
		console.log(chalk.magenta('[globalSettingsService.init]'))
		// if (force || (!this.get())) {
			await this.reset()
		// }
	}
}

export const globalSettingsService: GlobalSettingsService = new GlobalSettingsService()
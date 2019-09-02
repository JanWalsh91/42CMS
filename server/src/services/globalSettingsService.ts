import { IGlobalSettings } from '../interfaces'

import { GlobalSettings } from '../models'

class GlobalSettingsService {
	public async get(): Promise<IGlobalSettings> {
		return GlobalSettings.findOne()
	}

	public async reset(): Promise<IGlobalSettings> {
		await GlobalSettings.deleteMany({})
		const globalSettings = await new GlobalSettings()
		return globalSettings.save()
	}

	/**
	 * Creates new default settings if not present in database
	 * @param force Forces the reset
	 */
	public async init(force?: boolean): Promise<IGlobalSettings> {
		if (force || !(await this.get())) {
			return this.reset()
		}
	}
}

export const globalSettingsService: GlobalSettingsService = new GlobalSettingsService()
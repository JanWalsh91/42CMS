import chalk from 'chalk'

import { IObjectTypeDefinition, IGlobalSettings } from '../interfaces'
import { patchRequest, ValidationError } from '../utils'
import { globalSettingsService } from '.'
import { localeCode } from '../types'

class LocalizableAttributeService {
	
	public async update() {
		
	}

	private async validateValid(code: localeCode): Promise<void> {
		let globalSettings: IGlobalSettings = await globalSettingsService.get()
		if (!globalSettings.locale.localeIsAvailable(code)) {
			throw new ValidationError(`Invalid locale code: ${code}`)
		}
	}
}

export const localizableAttributeService: LocalizableAttributeService = new LocalizableAttributeService()
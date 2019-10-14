import { Document } from 'mongoose'

import { ILocale } from './'

export interface ILocaleSettings extends Document {
	availableLocales: ILocale[]
	
	// ==== add ====
	addAvailableLocale: (this: ILocaleSettings, locale: ILocale) => Promise<void>
	
	// ==== remove ====
	removeAvailableLocale: (this: ILocaleSettings, locale: ILocale) => Promise<void>

	reset: () => Promise<void>
	localeIsAvailable: (this: ILocaleSettings, id: string) => boolean
}

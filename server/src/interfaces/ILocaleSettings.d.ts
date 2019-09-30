import { Document } from 'mongoose'

import { ILocale } from './'

export interface ILocaleSettings extends Document {
	availableLocales: ILocale[],
	
	// add methods
	addAvailableLocale: (this: ILocaleSettings, locale: ILocale) => Promise<void>,
	
	// remove methods
	removeAvailableLocale: (this: ILocaleSettings, locale: ILocale) => Promise<void>,

	reset: () => Promise<void>,
	localeIsAvailable: (this: ILocaleSettings, id: string) => boolean,
}

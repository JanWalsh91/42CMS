import { Document } from 'mongoose'

import { ILocale } from './'

export interface ILocaleSettings extends Document {
	availableLocales: ILocale[],
	reset: () => Promise<void>,
	localeIsAvailable: (this: ILocaleSettings, id: string) => boolean,
	addAvailableLocale: (this: ILocaleSettings, locale: ILocale) => Promise<void>,
	removeAvailableLocale: (this: ILocaleSettings, locale: ILocale) => Promise<void>,
}

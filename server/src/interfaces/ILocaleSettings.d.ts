import { Document } from 'mongoose'

import { ILocale } from './'

export interface ILocaleSettings extends Document {
	availableLocales: ILocale[],
	reset: () => Promise<void>,
	localeIsAvailable: (this: ILocaleSettings, id: string) => boolean,
	localeIsValid: (this: ILocaleSettings, id: string) => boolean,
	addAvailableLocale: (this: ILocaleSettings, id: string) => Promise<void>,
	removeAvailableLocale: (this: ILocaleSettings, id: string) => Promise<void>,
}

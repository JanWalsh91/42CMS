import { Document } from 'mongoose'

import { ILocale } from './'

type jsonLocale = {
	id: string,
	language: string,
	country: string,
	fallback: string
}

export interface ILocaleSettings extends Document {
	availableLocales: ILocale[],
	getAllLocales: () => jsonLocale[],
	getDefaultLocales: () => jsonLocale[],
	reset: () => Promise<void>,
	localeIsAvailable: (this: ILocaleSettings, id: string) => boolean,
	localeIsValid: (this: ILocaleSettings, id: string) => boolean,
	addLocale: (this: ILocaleSettings, id: string) => Promise<void>,
	removeLocale: (this: ILocaleSettings, id: string) => Promise<void>,
}

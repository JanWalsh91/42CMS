import { ILocale } from './'

type jsonLocale = {
	id: string,
	language: string,
	country: string,
	fallback: string
}

export interface ILocaleSettings {
	allowedLocales: ILocale[],
	getAllLocales: () => jsonLocale[],
	getDefaultLocales: () => jsonLocale[],
	reset: () => Promise<void>,
}

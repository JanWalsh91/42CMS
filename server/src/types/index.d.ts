export type jsonLocale = {
	id: string,
	language: string,
	country?: string,
	fallback?: string
}

export type localeCode = 
	'default'	| 
	'en'		| 
	'en_US'		| 
	'fr'		| 
	'fr_FR'
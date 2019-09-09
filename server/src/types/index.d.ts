export type jsonLocale = {
	id: string,
	language: string,
	country?: string,
	fallback?: string
}

export type jsonDefaultObjectTypeDefinition = {
	type: string,
	system: boolean,
	localizable: boolean
}

export type localeCode = 
	'default'	| 
	'en'		| 
	'en_US'		| 
	'fr'		| 
	'fr_FR'

export type attributeType = 
	'string'	|
	'number'	|
	'string[]'	|
	'number[]'
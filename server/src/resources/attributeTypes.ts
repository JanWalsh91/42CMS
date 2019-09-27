const baseTypes: string[] = [
	'string',
	'html',
	'number',
	'boolean',
	'date',
	'image',
]

baseTypes.push(...baseTypes.map(x => x + '[]'))

export default baseTypes
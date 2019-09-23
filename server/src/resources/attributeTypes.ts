const baseTypes: string[] = [
	'string',
	'html',
	'number',
	'boolean',
	'date',
]

baseTypes.push(...baseTypes.map(x => x + '[]'))

export default baseTypes
import chalk from 'chalk'
import { async } from 'q';

// let updateProduct = {
// 	id: 'newId',					// patch simple property
// 	name: 'newname',
// 	// masterCatalog: 'newCatalog', // IMMUTABLE
// 	assignedCatalogs: [
// 		// list of 'actions'
// 		{ $add: 'catalogToAdd' },		// use mongo type actions
// 		{ $rm: 'catalogToRemove' }		// use mongo type actions
// 	],
// 	assignedPrimaryCategoriesByCatalog: {
// 		'catalog1': 'primaryCat',		// set
// 		'catalog2': null				// unset
// 	},
// 	assignedCategoriesByCatalog: {
// 		'catalog1': [
// 			{ $add: 'categoryToAdd' },	
// 			{ $rm: 'categoryToAdd' }	
// 		],
// 	}
// }

// let up = [
// 	{ $set: { id: 'newId' } },
// 	{ $set: { name: 'newName' } },
// 	{ $add: { assignedCatalogs: 'catalogToAdd' }},
// 	{ $rm: { assignedCatalogs: 'catalogToRemove' }},
// 	{ $set: { assignedPrimaryCategoriesByCatalog: 'test'}}
// ]

// start

type operation = '$add' | '$remove' | '$set' | '$unset'

type patchRequest = {
	[key: string]: action | action[]
}

type action = {
	op: operation,
	[key: string]: any
}

function isAction(action: any): action is action {
	return action.hasOwnProperty('op')
}

function isArrayOfActions(action: any): action is action[] {
	return Array.isArray(action) && action.every(isAction)
}

type patchFunction = (action: action) => Promise<void> | void

type patchMap = {
	[key: string]: Partial<Record<operation, patchFunction>>
}


abstract class patchable {
	protected abstract patchMap: any
	public async patch(patch: patchRequest): Promise<void> {
		console.log('======== PATCH =======')
		console.log(patch)
		
		// Parses the patchRequest and calls on update functions
		console.log('==== parse ====')
		for (let [key, value] of Object.entries(patch)) {
			console.log(`key: ${key}, value: `, value)
			if (!this.hasOwnProperty(key)) {
				throw `invalid property [${key}]: property not in obj`
			}
			if (!this.patchMap.hasOwnProperty(key)) {
				throw `invalid property [${key}]: property not in patchMap`
			}
			if (isAction(value)) {
				console.log(chalk.green('is action: '), value)
				await this.executeAction(key, value)
			} else if (isArrayOfActions(value)) {
				console.log(chalk.green('is action[]: '), value)
				await (<action[]>value).reduce((_, action: action) => _.then(() => this.executeAction(key, action as action)), Promise.resolve())
			} else {
				console.log(chalk.yellow('is not action: '), value)
				// Ingore, unless implement deeper stuff later
			}
		}
	}

	private async executeAction(key: string, action: action) {
		console.log('executeAction', key, action)
		if (!this.patchMap[key].hasOwnProperty(action.op)) {
			throw `action ${action.op} for ${key} is not available`
		}
		await this.patchMap[key][action.op](action)
	}

	protected hasRequiredProperties(action: action, props: any[]) {
		return props.every(prop => action.hasOwnProperty(prop))
	}
}

class Product extends patchable {
	constructor(id: string, name?: string) {
		super()

		this.id = id
		this.name = name ? name : 'no name'
		this.patchMap = {
			id: {
				$set: async (action: action): Promise<void> => {
					if (this.hasRequiredProperties(action, ['value'])) {
						throw `error`
					} else {
						await this.setId(action.value)
					}
				},
				$unset: async (action: action): Promise<void> => {
					await this.setId(null)
				}
			},
			name: {
				$set: async (action: action): Promise<void> => {

				}
			}
		}
	}
	
	public id: string
	public name: string
	protected patchMap: patchMap

	public async setId(newId: string) {
		console.log('set id to:', newId)
		this.id = newId
	}

	public toString () { return `{ id: ${this.id}, name: ${this.name} }` }
}


const patchRequest1: patchRequest = {
	id: { op: '$set', value: 'id2' }
}
const patchRequest2: patchRequest = {
	badKey: { op: '$set', value: 'id2' }
}
const patchRequest3: patchRequest = {
	name: { op: '$set', value: 'id2' }
}
const patchRequest4: patchRequest = {
	id: [
		{ op: '$set', value: 'id2' },
		{ op: '$unset', value: 'id2' }
	],
}
const requests = [
	patchRequest1,
	patchRequest2,
	patchRequest3,
	patchRequest4,
]

async function main() {
	for (let i in requests) {
		try {
			const p: Product = new Product('123')
			console.log('Before: ', p.toString())
			await p.patch(requests[i])
			console.log('After: ', p.toString())
		} catch (e) {
			console.log(chalk.red(e.stack))
		}
	}
}

main()

/* actions

assignedCatalogs:
- $add
	patch = { assignedCatalogs: { $add: 'catalogid' } }
- $remove
	patch = { assignedCatalogs: { $remove: 'catalogid' } }

primaryCategoryByCatalog:
- $set
	patch = { primaryCategoryByCatalog: { $set: 'primaryCategoryId', catalog: 'catalogid' } }
- $unset
	patch = { primaryCategoryByCatalog: { $unset: any, catalog: 'catalogid' } }

assignedCategoriesByCatalog:
- $add
	patch = { assignedCategoriesByCatalog: { $add: 'primaryCategoryId', catalog: 'catalogid' } }
- $remove
	patch = { assignedCategoriesByCatalog: { $remove: any, catalog: 'catalogid' } }







*/
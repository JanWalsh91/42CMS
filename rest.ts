import chalk from 'chalk'

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

const operations = ['$add', '$remove', '$set', '$unset']
type operation = '$add' | '$remove' | '$set' | '$unset'

// type addAction<T> = Record<'$add', addFunc<T> | T>
// type removeAction<T> = Record<'$remove', removeFunc<T> | T>
// type setAction<T> = Record<'$set', setFunc<T> | T>
// type unsetAction = Record<'$unset', unsetFunc | any>

// type action<T> = addAction<T> | removeAction<T> | setAction<T> | unsetAction;

function isAction<T>(val: action): val is action {
	return Object.keys(val).filter(key => operations.includes(key)).length === 1
}

function isArrayOfActions(val: action[]) {
	return Array.isArray(val) &&
		val.every(isAction)
}

type setFunc<T> = (value: T) => void
type unsetFunc = () => void
type addFunc<T> = (value: T) => void
type removeFunc<T> = (value: T) => void

type patchFunc<T> = setFunc<T> | unsetFunc | addFunc<T> | removeFunc<T>

interface PatchRequest {
	[key: string]: action | action[]
}


interface action<O> {
	operator: O
}

interface setAction extends action<'$set'> {

}

let a: setAction = {
	operator: '$set'

}


abstract class patchable {
	protected abstract patchMap: any
	public patch(patch: any): void {
		console.log('======== PATCH =======')
		console.log(patch)
		
		// Parses the patchRequest and calls on update functions
		console.log('==== parse ====')
		console.log('obj: ', this, 'patch: ', patch)
		for (let [key, value] of Object.entries(patch)) {
			console.log(`key: ${key}, value: `, value)
			if (!this.hasOwnProperty(key)) {
				throw `invalid property [${key}]: property not in obj`
			}
			if (!this.patchMap.hasOwnProperty(key)) {
				throw `invalid property [${key}]: property not in patchMap`
			}
			if (isAction(value as action<typeof value>)) {
				console.log(chalk.green('is action: '), value)
				executeAction(key, value as action<typeof value>)
			} else if (isArrayOfActions(value as action<typeof value>[])) {
				console.log(chalk.green('is action[]: '), value)
			} else {
				console.log(chalk.yellow('is not action: '), value)
				// go deeper: no need. only one level
			}
		}

		function executeAction(key: string, action: action<any>) {
			console.log('executeAction')
			this.patchMap[key][getOperation(action)](action)
		}

		function getOperation(action: action<any>) {
			return Object.keys(action).find(key => operations.includes(key))
		}
	}
}

class Product extends patchable {
	constructor(id: string) {
		super()

		this.id = id
		this.name = 'test'
		this.patchMap = {
			id: { $set: () => {

			}}
		}
	}
	
	public id: string
	public name: string
	protected patchMap: any;

	setId: setFunc<string> = (newId: string) => {
		console.log('set id', newId)
		this.id = newId
	}
}

let p: Product = new Product('123')
const patchRequest1: PatchRequest = {
	id: { $set: 'id2' }
}
const patchRequest2 = {
	badKey: { '$set': 'id2' }
}
const patchRequest3 = {
	name: { '$set': 'id2' }
}
const patchRequest4: PatchRequest = {
	id: [{ '$set': 'id2' }, { '$unset': 'id2' }],
}
const requests = [
	patchRequest1,
	// patchRequest2,
	// patchRequest3,
	// patchRequest4,
]
requests.forEach(request => {
	try {
		p.patch(request)
	} catch (e) {
		console.log(chalk.red(e))
	}
})

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
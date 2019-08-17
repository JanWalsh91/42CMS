let updateProduct = {
	id: 'newId',					// patch simple property
	name: 'newname',
	// masterCatalog: 'newCatalog', // IMMUTABLE
	assignedCatalogs: [
		// list of 'actions'
		{ $add: 'catalogToAdd' },		// use mongo type actions
		{ $rm: 'catalogToRemove' }		// use mongo type actions
	],
	assignedPrimaryCategoriesByCatalog: {
		'catalog1': 'primaryCat',		// set
		'catalog2': null				// unset
	},
	assignedCategoriesByCatalog: {
		'catalog1': [
			{ $add: 'categoryToAdd' },	
			{ $rm: 'categoryToAdd' }	
		],
	}
}
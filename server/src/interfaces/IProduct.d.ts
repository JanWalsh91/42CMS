import { Document } from 'mongoose'

import { ICatalog, ICategory, IExtensibleObject } from '../interfaces'
import { ILocalizableAttribute } from './ILocalizableAttribute'

export interface IProduct extends IExtensibleObject {
	id: string
	
	name: ILocalizableAttribute['_id']
	description: ILocalizableAttribute

	masterCatalog: ICatalog['_id'] | ICatalog
	assignedCatalogs: (ICatalog['_id'] | ICatalog)[]
	primaryCategoryByCatalog: {
		catalog: ICatalog['_id'] | ICatalog,
		category: ICategory['_id'] | ICategory
	}[]
	assignedCategoriesByCatalog: {
		catalog: ICatalog['_id'] | ICatalog,
		categories: (ICategory['_id'] | ICategory)[]
	}[]
	
	// set methods
	setPrimaryCategoryByCatalog: (categoryId: ICategory | null, catalogId: ICatalog) => Promise<void>

	// add methods
	addAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	addAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>
	
	// remove methods
	removeAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	removeAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>

	// internal attributes
	wasNew: boolean
}
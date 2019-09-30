import { Document } from 'mongoose'

import { ICatalog, ICategory, IExtensibleObject, IObjectAttributeDefinition, IObjectTypeDefinition } from '../interfaces'
import { ILocalizableAttribute } from './ILocalizableAttribute'
import { productType } from '../types';

export interface IProduct extends IExtensibleObject {
	id: string
	type: productType

	name: ILocalizableAttribute
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
	
	// get methods
	getObjectTypeDefinition: () => Promise<IObjectTypeDefinition>

	// set methods
	setId: (id: string): void
	setPrimaryCategoryByCatalog: (categoryId: ICategory | null, catalogId: ICatalog) => Promise<void>

	// add methods
	addAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	addAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>
	
	// remove methods
	removeAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	removeAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>

	// is methods
	isMaster: () => boolean
	isVariant: () => boolean
	isBasic: () => boolean

	// internal attributes
	wasNew: boolean
}
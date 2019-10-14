import { Document, ClientSession } from 'mongoose'

import { ICategory, IProduct, ISite } from './' 

export interface ICatalog extends Document {
	id: string
	name: string
	sites: (ISite['_id'] | ISite)[]
	rootCategory: ICategory['_id'] | ICategory
	categories: (ICategory['_id'] | ICategory)[] 
	products: (IProduct['_id'] | IProduct)[]
	/**
	 * Determines if this catalog owns products, or if products are assigned to it (cannot do both)
	 * Products can only be owned by one Catalog, but can be assigned to many
	 */
	master: boolean

	// ==== to ====
	toJSONForClient: () => Promise<object>

	// ==== set ====
	setId: (id: string) => Promise<ICatalog>
	setName: (id: string) => Promise<ICatalog>

	// ==== get ====
	getRootCategory: () => Promise<ICategory>
	getCategory: (query: object) => Promise<ICategory>
	getProduct: (query: object) => Promise<IProduct>
	
	// ==== add ====
	addCategory: (category: ICategory) => Promise<ICatalog>
	addProduct: (product: IProduct) => Promise<ICatalog>
	addSite: (site: ISite) => Promise<ICatalog>

	// ==== remove ====
	removeCategory: (category: ICategory) => Promise<ICatalog>
	removeProduct: (product: IProduct) => Promise<ICatalog>
	removeSite: (site: ISite) => Promise<ICatalog>

	wasNew: boolean // internal use
}
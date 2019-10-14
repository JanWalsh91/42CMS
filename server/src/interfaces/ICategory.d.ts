import { Document } from 'mongoose'

import { ICatalog, IProduct } from './' 

export interface ICategory extends Document {
	id: string
	name: string
	catalog: ICatalog['_id'] | ICatalog
	parent: ICategory['_id'] | ICategory
	subCategories: (ICategory['_id'] | ICategory)[]
	products: IProduct['_id'][]

	// ==== set ====
	setId: (id: string) => Promise<ICategory>
	setName: (name: string) => Promise<ICategory>

	// ==== get ====
	getParent: () => Promise<ICategory>
	getCatalog: () => Promise<ICatalog>
	getSubCategory: (query: object) => Promise<ICategory>
	// getProduct: (query: object) => Promise<IProduct>

	// ==== add ====
	addSubCategory: (category: ICategory) => Promise<ICategory>
	addProduct: (productId: IProduct) => Promise<ICategory>

	// ==== set ====
	setParent: (category: ICategory | null) => Promise<void>

	// ==== remove ====
	removeSubCategory: (category: ICategory) => Promise<ICategory>
	removeProduct: (product: IProduct) => Promise<ICategory>

	// internal use
	wasNew: boolean
}
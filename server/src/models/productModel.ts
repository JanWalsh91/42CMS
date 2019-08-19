import { Schema, Document, Model, model } from 'mongoose'
import { ICatalog, Catalog, ICategory } from './';

import chalk from 'chalk';
import { ValidationError } from '../utils';

class ProductClass {
	// ==== set ====

	async setPrimaryCategoryByCatalog(this: IProduct, category: ICategory | null, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.setPrimaryCategoryByCatalog] ${catalog.id} to ${this.id}`))
		await this.populate('assignedCatalogs').execPopulate()

		// add assigned catalog if not assigned
		if (!this.assignedCatalogs.find(x => x.id == catalog.id)) {
			await this.addAssignedCatalog(catalog)
		}
		// add assigned category if not assigned
		const categoriesForCatalog = this.assignedCategoriesByCatalog.find(x => x.catalog == catalog.id)
		if (!categoriesForCatalog) {
			throw new ValidationError(`Product ${this.id} not assigned to catalog ${catalog.id}`)
		}
		if (category && !categoriesForCatalog.categories.find(x => x == category.id)) {
			await this.addAssignedCategoryByCatalog(category, catalog)
		}
		let currentPrimaryCategoryByCatalog = this.primaryCategoryByCatalog.find(x => x.catalog == catalog.id)
		if (!currentPrimaryCategoryByCatalog){
			currentPrimaryCategoryByCatalog = { catalog: catalog.id, category: category ? category.id : null }
			this.primaryCategoryByCatalog.push(currentPrimaryCategoryByCatalog)
		} else {
			currentPrimaryCategoryByCatalog.category = category ? category.id : null
		}
		this.markModified('primaryCategoryByCatalog')
	}

	// ==== get ====
	async getMasterCatalog(this: IProduct): Promise<ICatalog> {
		await this.populate('masterCatalog').execPopulate()
		return this.masterCatalog
	}

	// ==== add ==== 
	async addAssignedCatalog(this: IProduct, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.addAssignedCatalog] ${catalog.id} to ${this.id}`))
		// console.log('catalog: ', catalog)
		await this.populate('assignedCatalogs').execPopulate()

		if (this.assignedCatalogs.find(x => x._id.equals(catalog._id))) {
			console.log(chalk.yellow(`Product ${this.id} already assigned to Catalog ${catalog.id}`))
			return 
		}
		this.assignedCatalogs.push(catalog)
		this.primaryCategoryByCatalog.push({ catalog: catalog.id, category: null })
		console.log('BEFORE', catalog.id, this.assignedCategoriesByCatalog)
		this.assignedCategoriesByCatalog.push({ catalog: catalog.id, categories: null })
		console.log('AFTER', catalog.id, this.assignedCategoriesByCatalog)
		this.markModified('assignedCatalogs')
		this.markModified('primaryCategoryByCatalog')
		this.markModified('assignedCategoriesByCatalog')
	}

	async addAssignedCategoryByCatalog(this: IProduct, category: ICategory, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.addAssignedCategoryByCatalog] catalog: ${catalog.id}, category: ${category.id}, product: ${this.id}`))
		await this.populate('assignedCatalogs').execPopulate()
		console.log(this)		
		if (!this.assignedCatalogs.find(x => x.id == catalog.id)) {
			await this.addAssignedCatalog(catalog)
		}
		console.log('assignedCategoriesByCatalog: ', this.assignedCategoriesByCatalog)
		let categoriesForCatalog = this.assignedCategoriesByCatalog.find(x => x.catalog == catalog.id)		
		if (!categoriesForCatalog.categories.includes(category.id)) {
			categoriesForCatalog.categories.push(category.id)
			this.markModified('assignedCategoriesByCatalog')
		}
	}

	// ==== remove ==== 
	async removeAssignedCatalog(this: IProduct, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.removeAssignedCatalog] ${catalog.id} to ${this.id}`))
		await this.populate('assignedCatalogs').execPopulate()
		this.assignedCatalogs = this.assignedCatalogs.filter(x => !x._id.equals(catalog._id))
		this.primaryCategoryByCatalog = this.primaryCategoryByCatalog.filter(x => x.catalog != catalog.id)
		this.assignedCategoriesByCatalog = this.assignedCategoriesByCatalog.filter(x => x.catalog != catalog.id)
		this.markModified('assignedCatalogs')
		this.markModified('primaryCategoryByCatalog')
		this.markModified('assignedCategoriesByCatalog')
	}

	async removeAssignedCategoryByCatalog(this: IProduct, category: ICategory, catalog: ICatalog): Promise<void> {
		console.log(chalk.magenta(`[ProductModel.removeAssignedCategoryByCatalog] catalog: ${catalog.id}, category: ${category.id}, product: ${this.id}`))
		await this.populate('assignedCatalogs').execPopulate()
		if (!this.assignedCatalogs.find(x => x.id == catalog.id)) {
			return 
		}
		let categoriesForCatalog = this.assignedCategoriesByCatalog.find(x => x.catalog == catalog.id)		
		if (categoriesForCatalog && categoriesForCatalog.categories.includes(category.id)) {
			categoriesForCatalog.categories = categoriesForCatalog.categories.filter(x => x != category.id)
			this.markModified('assignedCategoriesByCatalog')
		}
	}
}

export interface IProduct extends Document {
	id: string
	name: string
	masterCatalog: ICatalog['_id'] | ICatalog
	assignedCatalogs: (ICatalog['_id'] | ICatalog)[]
	primaryCategoryByCatalog: { catalog: string, category: string }[]
	assignedCategoriesByCatalog: { catalog: string, categories: string[] }[]

	// get methods
	// getMasterCatalog: () => Promise<ICatalog>
	// getAssignedCatalog: (query: object) => Promise<ICatalog>
	// getPrimaryCategoryByCatalog: (query: object) => Promise<>
	// getAssignedCategoriesByCatalog: (query: object) => Promise<>

	// set methods
	// setName: (name: string) => void
	// setMasterCatalog: (catalogId: ICatalog | null) => Promise<void>
	setPrimaryCategoryByCatalog: (categoryId: ICategory | null, catalogId: ICatalog) => Promise<void>

	// add methods
	addAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	addAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>
	
	// remove methods
	removeAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	removeAssignedCategoryByCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>

	// methods
	// updateAttributes(attributed: UpdatableAttributes): Promise<any>
	// updateName(name: string): Promise<any>
	// updateMasterCatalog(catalogid: string): Promise<any>
	// updateAssignedCategoriesByCatalog(assignedCategoriesByCatalog: AssignedCategoriesByCatalog): Promise<any>
	// updatePrimaryCategoryByCatalog(primaryCategoryByCatalog: PrimaryCategoryByCatalog): Promise<any>

	// virtuals
	// catalogs: ICatalog[]

	// internal attributes
	wasNew: boolean
}

export const ProductSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true
	},
	masterCatalog: {
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		required: true,
	},
	assignedCatalogs: {
		type: [Schema.Types.ObjectId],
		ref: 'Catalog',
		default: [],
	},
	assignedCategoriesByCatalog: [new Schema({
		catalog: String,
		category: String
	}, {_id: false, minimize: false})],
	primaryCategoryByCatalog: [new Schema({
		catalog: String,
		category: [String]
	}, {_id: false, minimize: false})]
}).loadClass(ProductClass)

// console.log(ProductSchema)

// process.exit()

// ProductSchema.virtual('catalogs').get(function(this: IProduct) {
// 	console.log(chalk.magenta('ProductSchema virtual catalogs '))
// 	return [this.masterCatalog, ...this.assignedCatalogs]
// })

export const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema)

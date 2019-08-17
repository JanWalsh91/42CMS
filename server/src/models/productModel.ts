import { Schema, Document, Model, model } from 'mongoose'
import { ICatalog, Catalog, ICategory } from './';

import chalk from 'chalk';

class ProductClass {
	// define virtuals here

	async getMasterCatalog(this: IProduct): Promise<ICatalog> {
		await this.populate('masterCatalog').execPopulate()
		return this.masterCatalog
	}

	// TODO: 
	// getPrimaryCategoryByCatalog: (query: object) => Promise<>
	// getAssignedCategoriesByCatalog: (query: object) => Promise<>

	// set methods
	// setName(this: IProduct, name: string): void {
	// 	this.name = name
	// }

	// async setMasterCatalog(this: IProduct, catalogId: ICatalog['_id'] | null, options?: ModelUpdateOptions): Promise<ServerError | void> {
	// 	console.log(chalk.magenta(`[ProductModel.setMasterCatalog] ${catalogId} from ${this._id}`))
	// 	if (!catalogId) {
	// 		this.masterCatalog = null
	// 		this.markModified('masterCatalog')
	// 		// TODO: can you unset? Or is a masterCatalog required?
	// 	} else {
	// 		if (!options.skipCheckExists) {
	// 			await this.getProject()
	// 			const catalog: ICatalog = await this.project.getCatalog({ _id: catalogId })
	// 			if (!catalog) {
	// 				throw new ServerError(ErrorType.CATALOG_NOT_FOUND)
	// 			}
	// 		}
	// 		if (catalogId === this.populated('masterCatalog') ? this.masterCatalog._id : this.masterCatalog) {
	// 			console.log(chalk.yellow('[ProductModel.setParent] category already is parent'))
	// 			return 
	// 		}
	// 		this.masterCatalog = catalogId
	// 		this.markModified('masterCatalog')
	// 	}
	// }

	// async setPrimaryCategoryInCatalog(this: IProduct, categoryId: ICategory['_id'] | null, catalogId: ICatalog['_id'], options?: ModelUpdateOptions): Promise<ServerError | void> {
	// 	if (!options.skipCheckExists) {
	// 		// Check if product is assigned to catalog
	// 		let assignedCatalog: ICatalog = await this.getAssignedCatalog({ _id: catalogId })
	// 		if (assignedCatalog) {
	// 			throw new ServerError(ErrorType.PRODUCT_NOT_ASSIGNED_TO_CATALOG)
	// 		}
	// 		// Check if category exists in catalog
	// 		let newPrimaryCateogory = await assignedCatalog.getCategory({ _id: categoryId })
	// 		if (!newPrimaryCateogory) {
	// 			throw new ServerError(ErrorType.CATEGORY_NOT_FOUND)
	// 		}
	// 		// TODO: update to type and use as list of type (see type definition)
	// 		// this.primaryCategoryByCatalog.find((primaryCategoryForCatalog) => primaryCategoryForCatalog.catalog == catalogId)
	// 	}
	// }
	


	// async addAssignedCatalog(this: IProduct, catalogId: ICatalog['_id'], options?: ModelUpdateOptions): Promise<ServerError | void> {
	// 	console.log(chalk.magenta(`[ProductModel.addAssignedCatalog] ${catalogId} to ${this._id}`))
	// 	if (!options.skipCheckExists) {
	// 		// await this.getProject()
	// 		// await this.project.getCatalogs()
	// 		// const catalog: ICatalog = await this.project.catalogs({ _id: catalogId })
	// 		// if (!catalog) {
	// 		// 	throw new ServerError(ErrorType.CATALOG_NOT_FOUND)
	// 		// }
	// 	}
	// 	if (catalogId in this.assignedCatalogs) {
	// 		console.log(chalk.yellow('[ProductModel.addSubCategory] catalog already in assignedCatalogs'))
	// 		return 
	// 	}
	// 	this.assignedCatalogs.push(catalogId)
	// 	this.markModified('assignedCatalogs')
	// } 

	// TODO: 
	// async addAssignedCategoryInCatalog(this: IProduct, categoryId: ICategory['_id'], catalogId: ICatalog['_id'], options?: ModelUpdateOptions): Promise<ServerError | void> {
	// 	console.log(chalk.magenta(`[ProductModel.addAssignedCategoryInCatalog] ${categoryId} in ${catalogId} to ${this._id}`))
	// }


	// async updateAttributes(this: IProduct, attributes: UpdatableAttributes) {
	// 	let { name, masterCatalog, primaryCategoryByCatalog, assignedCategoriesByCatalog } : UpdatableAttributes = attributes
	// 	console.log(attributes);
		
	// 	// let populateParams: ModelPopulateOptions[] = []
	// 	let promises = []

	// 	if (name) promises.push(this.updateName(name))
	// 	if (masterCatalog) promises.push(this.updateMasterCatalog(masterCatalog))
	// 	if (primaryCategoryByCatalog) promises.push(this.updatePrimaryCategoryByCatalog(primaryCategoryByCatalog))
	// 	if (assignedCategoriesByCatalog) promises.push(this.updateAssignedCategoriesByCatalog(assignedCategoriesByCatalog))

	// 	return Promise.all(promises)		
	// }

	// async updateName(this: IProduct, name: string): Promise<any> {
	// 	console.log('updateName')
	// 	this.name = name;
	// }

	// async updateMasterCatalog(this: IProduct, catalogid: string) {
	// 	console.log('updateMasterCatalog')
	// 	await this.populate([{path: 'masterCatalog'}]).execPopulate()
	// 	let newMasterCatalog: ICatalog = await Catalog.findOne({ , id: catalogid })
	// 	if (!newMasterCatalog) {
	// 		throw (new ServerError(ErrorType.CATALOG_NOT_FOUND, catalogid))
	// 	}
	// 	this.masterCatalog.removeProduct(this)
	// 	newMasterCatalog.addProduct(this)
	// 	await Promise.all([
	// 		this.masterCatalog.save(),
	// 		newMasterCatalog.save(),
	// 	])
	// 	this.masterCatalog = newMasterCatalog._id
	// }

	// async updatePrimaryCategoryByCatalog(this: IProduct, primaryCategoryByCatalog: PrimaryCategoryByCatalog) {
	// 	console.log('updatePrimaryCategoryByCatalog')
	// }


	// async updateAssignedCategoriesByCatalog(this: IProduct) {}



}

export interface IProduct extends Document {
	id: string
	name: string
	masterCatalog: ICatalog['_id'] | ICatalog
	// assignedCatalogs: (ICatalog['_id'] | ICatalog)[]
	// primaryCategoryByCatalog: PrimaryCategoryByCatalog
	// assignedCategoriesByCatalog: AssignedCategoriesByCatalog

	// get methods
	// getMasterCatalog: () => Promise<ICatalog>
	// getAssignedCatalog: (query: object) => Promise<ICatalog>
	// getPrimaryCategoryByCatalog: (query: object) => Promise<>
	// getAssignedCategoriesByCatalog: (query: object) => Promise<>

	// set methods
	// setName: (name: string) => void
	// setMasterCatalog: (catalogId: ICatalog | null) => Promise<void>
	// setPrimaryCategoryInCatalog: (categoryId: ICategory | null, catalogId: ICatalog) => Promise<void>

	// add methods
	// addAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	// addAssignedCategoryInCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>
	
	// remove methods
	// removeAssignedCatalog: (catalogId: ICatalog) => Promise<void>
	// removeAssignedCategoryInCatalog: (categoryId: ICategory, catalogId: ICatalog) => Promise<void>

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
	// assignedCatalogs: [{
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Catalog',
	// }],
	// primaryCategoryByCatalog: {
	// 	type: [{
	// 		catalog: { type: Schema.Types.ObjectId, ref: 'Catalog' },
	// 		category: { type: Schema.Types.ObjectId, ref: 'Category' }
	// 	}],
	// 	default: []
	// },
	// assignedCategoriesByCatalog: {
	// 	type: [{
	// 		catalog: { type: Schema.Types.ObjectId, ref: 'Catalog' },
	// 		category: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
	// 	}],
	// 	default: []
	// },
}).loadClass(ProductClass)

// ProductSchema.virtual('catalogs').get(function(this: IProduct) {
// 	console.log(chalk.magenta('ProductSchema virtual catalogs '))
// 	return [this.masterCatalog, ...this.assignedCatalogs]
// })

export const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema)

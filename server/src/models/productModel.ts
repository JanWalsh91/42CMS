import { Schema, Document, Model, model, ModelPopulateOptions } from 'mongoose'
import { ICatalog, Catalog, CatalogSchema } from './catalogModel';
import { ICategory } from './categoryModel';
import chalk from 'chalk';
import { Project, IProject } from './projectModel';
import { ServerError, ErrorType } from '../utils/ServerError';

export type AssignedCategoriesByCatalog = [Record<ICatalog['_id'] | string, ICategory['_id'] | string | ICategory>]

export type PrimaryCategoryByCatalog = {
	[catalogid: string] : string | ICategory
};
// Cannot update project
export interface UpdatableAttributes {
	name?: string,
	masterCatalog?: string | ICatalog,
	assignedCatalogs?: (string | ICatalog)[],
	primaryCategoryByCatalog? : PrimaryCategoryByCatalog,
	assignedCategoriesByCatalog?: AssignedCategoriesByCatalog,
};

class ProductClass {
	// define virtuals here

	async update(this: IProduct, attributes: UpdatableAttributes) {
		let { name, masterCatalog, assignedCategoriesByCatalog } : UpdatableAttributes = attributes
		
		let populateParams: ModelPopulateOptions[] = []
		
		if (assignedCategoriesByCatalog) {
			// Populate product.masterCatalog
			// Populate product.assignedCatalogs
			// => Can access through product.catalogs
			populateParams.push({ path: 'masterCatalog' })
			populateParams.push({ path: 'assignedCatalogs' })
		}
		if (masterCatalog) {
			populateParams.push({ path: 'masterCatalog' })
		}
		if (populateParams.length > 0) {
			await this.populate(populateParams).execPopulate()
			console.log('======= AFTER POPULATE', this.masterCatalog)
		}

		if (assignedCategoriesByCatalog) {
			// For each catalog
			for (let catalogid in assignedCategoriesByCatalog) {
				console.log('CATALOG', catalogid)
				// Get catalog populated with categories
				let catalog: ICatalog = await this.catalogs.find((catalog: ICatalog) => catalog.id == catalogid)
				if (!catalog) {
					throw (new ServerError(ErrorType.CATALOG_NOT_FOUND, 'catalogid'))
				}
				await catalog.populate('categories').execPopulate()
				console.log({catalog})
				
				assignedCategoriesByCatalog[catalogid] = await new Promise(async (resolve, reject) => {
					// Return array of categories
					let assignedCategories = assignedCategoriesByCatalog[catalogid]
					.map((categoryid: string) => {
						console.log('CATEGORY', categoryid)
						const _category: ICategory = catalog.categories.find((category: ICategory) => category.id == categoryid)
						return _category ? _category._id : null
					})
					resolve(assignedCategories.filter(x => !!x))
				})

				console.log('=======updating ', this.assignedCategoriesByCatalog)
				this.assignedCategoriesByCatalog[catalog._id] = assignedCategoriesByCatalog[catalogid]
				this.markModified(`assignedCategoriesByCatalog`)
				console.log('=======updated ', this.assignedCategoriesByCatalog)
			}
			
		} else if (assignedCategoriesByCatalog == null) {

		}

		if (masterCatalog) {
			let id = masterCatalog
			masterCatalog = await Catalog.findOne({ project: this.project, id: masterCatalog })
			if (!masterCatalog) {
				throw (new ServerError(ErrorType.CATALOG_NOT_FOUND, id.toString()))
			}
			let oldMasterCatelog: ICatalog = this.masterCatalog
			oldMasterCatelog.removeProduct(this)
			masterCatalog.addProduct(this)
			await Promise.all([
				oldMasterCatelog.save(),
				masterCatalog.save(),
			])
			this.masterCatalog = masterCatalog._id
		} else if (masterCatalog == null) {

		}		
	}
}

export interface IProduct extends Document {
	id: string,
	name: string,
	project: IProject['_id'],
	masterCatalog: ICatalog['_id'],
	assignedCatalogs: [ICatalog['_id']],
	primaryCategoryByCatalog: [Record<ICatalog['_id'], ICategory['_id']>],
	assignedCategoriesByCatalog: [Record<ICatalog['_id'], [ICategory['_id']]>]

	// virtuals
	catalogs: ICatalog[],

	// internal
	wasNew: boolean,
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
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project',
		required: true
	},
	masterCatalog: {
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		required: true,
	},
	assignedCatalogs: [{
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
	}],
	primaryCategoryByCatalog: {
		type: Map,
		of: {
			type: Schema.Types.ObjectId,
			ref: 'Category'
		},
		default: {},
	},
	assignedCategoriesByCatalog: {
		type: Map,
		of: [{
			type: Schema.Types.ObjectId,
			ref: 'Category'
		}],
		default: [],
	}
	// categoriesByCatalogs: primary + assigned
}).loadClass(ProductClass)

ProductSchema.virtual('catalogs').get(function(this: IProduct) {
	console.log(chalk.magenta('ProductSchema virtual catalogs '))
	return [this.masterCatalog, ...this.assignedCatalogs]
})

ProductSchema.pre('save', function(this: IProduct, next: Function) {
	if (this.isNew) {
		this.wasNew = true
		console.log(chalk.magenta('ProductSchema pre save ' + this.id))
		console.log(chalk.yellow('is new!'))
		
		// Check if id in Project
		// Update project.products
		let addProductToProject = new Promise((resolve, reject) => {
			Project.findById(this.project, (err, project: IProject) => {
				if (err) { reject(err); return; }
				
				err = project.addProduct(this)
				if (err) { reject(err); return; }
				
				project.save((err, _project: IProject) => {
					if (err) { reject(err); return; }
					resolve()
				})
			})
		})

		// Check if masterCatalog.isMaster // TODO
		// Update catalog.products
		let addProductToCatalog = new Promise((resolve, reject) => {
			Catalog.findById(this.masterCatalog, (err, catalog: ICatalog) => {
				if (err) { reject(err); return; }
				
				err = catalog.addProduct(this)
				if (err) { reject(err); return; }
				
				catalog.save((err, _catalog: ICatalog) => {
					if (err) { reject(err); return; }
					resolve()
				})
			})
		})

		Promise.all([addProductToProject, addProductToCatalog])
			.then(() => next())
			.catch((err) => next(err))
	} else {
		next()
	}
})

export const Product: Model<IProduct> = model<IProduct>('Product', ProductSchema)

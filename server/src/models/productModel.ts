import { Schema, Document, Model, model } from 'mongoose'
import { ICatalog, Catalog } from './catalogModel';
import { ICategory } from './categoryModel';
import chalk from 'chalk';
import { Project, IProject } from './projectModel';
import { ServerError, ErrorType } from '../utils/ServerError';

class ProductClass {
	// define virtuals here

}

export interface IProduct extends Document {
	id: string,
	name: string,
	project: IProject['_id'],
	masterCatalog: ICatalog['_id'],
	assignedCatalogs: [ICatalog['_id']],
	primaryCategoryByCatalog: [Record<ICatalog['_id'], ICategory['_id']>],
	assignedCategoriesByCatalog: [Record<ICatalog['_id'], [ICategory['_id']]>]

	wasNew: boolean, // internal
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
		}
	},
	assignedCategoriesByCatalog: {
		type: Map,
		of: [{
			type: Schema.Types.ObjectId,
			ref: 'Category'
		}]
	}
}).loadClass(ProductClass)

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

export const Product: Model<IProduct> = model('Product', ProductSchema)

import { Schema, Document, Model, model } from 'mongoose'
import { ICatalog } from './catalogModel';
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
		Project.findById(this.project, (err, project: IProject) => {
			if (err) { next(err); return; }

			if (project.products.some((product: IProduct) => product.id == this.id)) {
				next(new ServerError(ErrorType.PRODUCT_EXISTS, this.id))
				return
			}
			project.products.push(this._id)
			project.markModified('products')
			project.save((err, _project: IProject) => {
				if (err) { next(err); return; }
				next()
			})
		})

		next()
	} else {
		next()
	}
})

export const Product: Model<IProduct> = model('Product', ProductSchema)

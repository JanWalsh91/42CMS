import { Schema, Document, Model, model } from 'mongoose'
import { ICatalog } from './catalogModel';
import { ICategory } from './categoryModel';
import chalk from 'chalk';

class ProductClass {
	// define virtuals here

}

export interface IProduct extends Document {
	id: string,
	name: string,
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
		this.wasNew = false
		console.log(chalk.magenta('CategorySchema pre save ' + this.id))
		console.log(chalk.yellow('is new!'))
		
		// Check if id already in Catalog

		next()
	} else {
		next()
	}
})

export const Product: Model<IProduct> = model('Product', ProductSchema)

import { Schema, Document, Model, model } from 'mongoose'
import { ICatalog } from './catalogModel';
import { ICategory } from './categoryModel';

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

export const Product: Model<IProduct> = model('Product', ProductSchema)

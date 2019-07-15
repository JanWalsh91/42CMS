import { Schema, Document, Model, model, SchemaType } from 'mongoose';

import { IUser } from './userModel';
import { ICatalog, CatalogSchema } from './catalogModel';
import { IProduct, ProductSchema } from './productModel';

class ProjectClass {
	// define virtuals here
	getCatalog(this: IProject, query): ICatalog {
		for (let i = 0; i < this.catalogs.length; i++) {
			let catalog = this.catalogs[i]
			if (Object.keys(query).every(key => catalog[key] == query[key])) {
				return catalog
			}
		}
		return null;
	}
}

export interface IProject extends Document {
	id: string,
	name: string,
	owner: IUser['_id'],
	catalogs: ICatalog[],
	products: IProduct[],
	getCatalog: (query: object) => ICatalog,
}

export const ProjectSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	catalogs: [CatalogSchema],
	products: [ProductSchema],

}).loadClass(ProjectClass)

export const Project: Model<IProject> = model('Project', ProjectSchema);
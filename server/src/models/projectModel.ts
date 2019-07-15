import { Schema, Document, Model, model, SchemaType } from 'mongoose';

import { IUser } from './userModel';
import { ICatalog, CatalogSchema } from './catalogModel';
import { IProduct, ProductSchema } from './productModel';

class ProjectClass {
	// define virtuals here
}

export interface IProject extends Document {
	id: string,
	name: string,
	owner: IUser['_id'],
	catalogs: ICatalog[],
	// products: IProduct[],
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
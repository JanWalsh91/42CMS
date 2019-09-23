import { Schema } from 'mongoose'
import { IProductVariant, IObjectAttributeDefinition, IObjectTypeDefinition } from '../interfaces';

const productVariantSchema = new Schema({
	masterProduct: {
		type: Schema.Types.ObjectId,
		ref: 'ProductMaster',
		required: true,
	},
	type: {
		type: String,
		enum: 'variant',
		default: 'variant'
	},
})

productVariantSchema.plugin(require('mongoose-autopopulate'))

export {
	productVariantSchema
}
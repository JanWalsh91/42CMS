import { Schema } from 'mongoose'

const productVariantSchema = new Schema({
	masterProduct: {
		type: Schema.Types.ObjectId,
		ref: 'MasterProduct',
	},
})

export {
	productVariantSchema
}
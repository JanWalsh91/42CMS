import { Schema } from 'mongoose'

const productMasterSchema = new Schema({
	variantProducts: [{
		type: Schema.Types.ObjectId,
		ref: 'VariantProduct',
	}]
})

export {
	productMasterSchema
}
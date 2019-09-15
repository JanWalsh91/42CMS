import { Schema } from 'mongoose'

const siteSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true,
	},
	assignedCatalogs: [{
		type: Schema.Types.ObjectId,
		ref: 'Catalog',
		default: null
	}]
})

siteSchema.methods = {

}

siteSchema.plugin(require('mongoose-autopopulate'))

export {
	siteSchema
}
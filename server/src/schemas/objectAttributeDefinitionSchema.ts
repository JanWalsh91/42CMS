import { Schema } from 'mongoose'

const attributeTypes: string[] = require('../src/resources/')

const objectAttributeDefinitionSchema = new Schema({
	type: {
		type: String,
		validate: (x) => attributeTypes.includes(x),
	},
	system: {
		type: Boolean,
		default: false,
	},
	localizable: {
		type: Boolean,
		default: true,
	},
	objectTypeDefinition: {
		type: Schema.Types.ObjectId,
		ref: 'ObjectTypeDefinition',
		required: true,
	}
})

objectAttributeDefinitionSchema.methods = {

}

export {
	objectAttributeDefinitionSchema,
}
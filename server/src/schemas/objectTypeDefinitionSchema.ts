import { Schema } from 'mongoose'
import { objectAttributeDefinitionSchema } from '.';

const objectTypeDefinitionSchema = new Schema({
	objectName: {
		type: String,
		validate: (x) => ['Product'].includes(x),
		unique: true,
	},
	objectAttributeDefinitions: {
		type: [objectAttributeDefinitionSchema],
		default: [],
	}
})

objectTypeDefinitionSchema.methods = {

}

export { 
	objectTypeDefinitionSchema,
}

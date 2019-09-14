import { Schema } from 'mongoose'
import { objectAttributeDefinitionSchema } from '.';
import { IObjectTypeDefinition, IObjectAttributeDefinition } from '../interfaces';

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
	addObjectAttributeDefinition: function (this: IObjectTypeDefinition, OAD) : void {
		this.objectAttributeDefinitions.push(OAD)
	}
}

export { 
	objectTypeDefinitionSchema,
}

import { Schema } from 'mongoose'
import { IObjectTypeDefinition, IObjectAttributeDefinition } from '../interfaces'

const objectTypeDefinitionSchema = new Schema({
	objectName: {
		type: String,
		validate: (x) => ['Product', 'Image', 'Site'].includes(x),
		unique: true,
	},
	objectAttributeDefinitions: {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'ObjectAttributeDefinition',
			autopopulate: true,
		}],
		default: [],
	}
})

objectTypeDefinitionSchema.methods = {
	addObjectAttributeDefinition: async function (this: IObjectTypeDefinition, OAD: IObjectAttributeDefinition) : Promise<void> {
		if (this.objectAttributeDefinitions.every(x => x.path != OAD.path)) {
			this.objectAttributeDefinitions.push(OAD)
			this.markModified('objectAttributeDefinitions')
		}
	},
	removeObjectAttributeDefinition: async function (this: IObjectTypeDefinition, OAD: IObjectAttributeDefinition) : Promise<void> {
		this.objectAttributeDefinitions = this.objectAttributeDefinitions.filter(x => x.path != OAD.path)
		await OAD.remove()
		this.markModified('objectAttributeDefinitions')
	},
	getAttribute: function (this: IObjectTypeDefinition, path: string): IObjectAttributeDefinition {
		return this.objectAttributeDefinitions.find(x => x.path == path) 
	}
}

objectTypeDefinitionSchema.pre('remove', async function(this: IObjectTypeDefinition) {
	await Promise.all(this.objectAttributeDefinitions.map(x => x.remove()))
})

objectTypeDefinitionSchema.plugin(require('mongoose-autopopulate'))

export { 
	objectTypeDefinitionSchema,
}

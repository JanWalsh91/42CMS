import { Schema } from 'mongoose'
import chalk from 'chalk'
import { IImage, IObjectTypeDefinition } from '../interfaces'
import { LocalizableAttribute } from '../models'
import { objectTypeDefinitionService } from '../services'

const imageSchema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	alt: {
		type: Schema.Types.ObjectId,
		ref: 'LocalizableAttribute',
		autopopulate: true,
		defaultType: 'string', // used to initialize the ObjectTypeDefinition,
	},
	custom: {
		type: Map,
		of: {
			type: Schema.Types.ObjectId,
			ref: 'LocalizableAttribute',
			autopopulate: true,
		},
		default: new Map(),
	},
	path: String
})
imageSchema.methods = {
	getObjectTypeDefinition(this: IImage): Promise<IObjectTypeDefinition> {
		return objectTypeDefinitionService.getById('Image')
	},
}

imageSchema.plugin(require('mongoose-autopopulate'))

imageSchema.pre('save', async function(this: IImage) {
	if (this.isNew) {
		await ['alt'].reduce((_: Promise<any>, path: string) =>
			_.then(async() => {
				this[path] = await new LocalizableAttribute().save()
			}
		), Promise.resolve())
		await objectTypeDefinitionService.initExtensibleObject(this)
	}
})

export {
	imageSchema,
}
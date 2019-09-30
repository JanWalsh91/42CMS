import { Schema } from 'mongoose'

import attributeTypes from '../resources/attributeTypes'
import { IObjectAttributeDefinition } from '../interfaces'
import { ValidationError } from '../utils'
import { attributeType } from '../types'

const objectAttributeDefinitionSchema = new Schema({
	path: {
		type: String,
		require: true,
	},
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
	setType: function (this: IObjectAttributeDefinition, type: attributeType) {
		if (!attributeTypes.includes(type)) {
			throw new ValidationError(`Invalid type ${type}`)
		}
		this.type = type
	},
	setLocalizable: function (this: IObjectAttributeDefinition, localizable: boolean) {
		this.localizable = localizable
	},
}

objectAttributeDefinitionSchema.plugin(require('mongoose-autopopulate'))

export {
	objectAttributeDefinitionSchema,
}
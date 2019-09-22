import { Document } from 'mongoose'

import { ILocalizableAttribute, IObjectTypeDefinition } from '.'

export interface IExtensibleObject extends Document {
	custom: Map<string, ILocalizableAttribute>
	getObjectTypeDefinition: () => Promise<IObjectTypeDefinition>
}
import { Document } from 'mongoose'
import { IObjectAttributeDefinition } from '.'

/**
 * Defineds the types of custom attributes for objects
 */

export interface IObjectTypeDefinition extends Document {
	objectAttributeDefinitions: IObjectAttributeDefinition[]	
	objectName: 'Product'

	addObjectAttributeDefinition: (OAD: IObjectAttributeDefinition) => void
	getAttribute: (path: string) => IObjectAttributeDefinition
}
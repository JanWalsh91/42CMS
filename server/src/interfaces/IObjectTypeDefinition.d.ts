import { Document } from 'mongoose'
import { IObjectAttributeDefinition } from '.'

/**
 * Defineds the types of custom attributes for objects
 */

export interface IObjectTypeDefinition extends Document {
	objectAttributeDefinitions: IObjectAttributeDefinition[]	
	objectName: string

	addObjectAttributeDefinition: (OAD: IObjectAttributeDefinition) => Promise<void>
	removeObjectAttributeDefinition: (OAD: IObjectAttributeDefinition) => Promise<void>
	getAttribute: (path: string) => IObjectAttributeDefinition
}
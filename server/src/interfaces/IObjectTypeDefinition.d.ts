import { Document } from 'mongoose'

import { IObjectAttributeDefinition } from '.'

/**
 * Defineds the types of custom attributes for objects
 */

export interface IObjectTypeDefinition extends Document {
	objectAttributeDefinitions: IObjectAttributeDefinition[]	
	objectName: string

	// ==== get ====
	getAttribute: (path: string) => IObjectAttributeDefinition
	
	// ==== add ====
	addObjectAttributeDefinition: (OAD: IObjectAttributeDefinition) => Promise<void>

	// ==== remove ====
	removeObjectAttributeDefinition: (OAD: IObjectAttributeDefinition) => Promise<void>
}
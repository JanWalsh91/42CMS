import { Document } from 'mongoose'

import { attributeType } from '../types'
import { IObjectTypeDefinition } from '../interfaces'

/**
 * Custom attribute type definitions
 */
export interface IObjectAttributeDefinition extends Document {
	// property name
	path: string
	type: attributeType
	// always false for now
	system: boolean
	localizable: boolean
	// objectTypeDefinition: IObjectTypeDefinition['_id']
	objectTypeDefinition: IObjectTypeDefinition

	setType?: (type: attributeType) => void
	setLocalizable?: (localizable: boolean) => void
}
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
	system: boolean
	localizable: boolean
	objectTypeDefinition: IObjectTypeDefinition

	// ==== set ====
	setType?: (type: attributeType) => void
	setLocalizable?: (localizable: boolean) => void
}
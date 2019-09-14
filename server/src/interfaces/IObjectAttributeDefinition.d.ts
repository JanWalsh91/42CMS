import { attributeType } from '../types'
import { IObjectTypeDefinition } from '../interfaces';

/**
 * Custom attribute type definitions
 */
export interface IObjectAttributeDefinition {
	// property name
	path: string,
	type: attributeType,
	// always false for now
	system: boolean,
	localizable: boolean,
	// objectTypeDefinition: IObjectTypeDefinition['_id'],

	setType?: (type: attributeType) => void,
	setLocalizable?: (localizable: boolean) => void,
}
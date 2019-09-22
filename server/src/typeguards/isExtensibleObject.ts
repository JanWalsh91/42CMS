import { IExtensibleObject } from "../interfaces";

export function isExtensibleObject(obj: any): obj is IExtensibleObject {
	return 'custom' in obj && obj.custom !== undefined
}
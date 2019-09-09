import { IAttribute, ILocalizedAttribute } from '../interfaces'

export function isILocalizedAttribute(attribute: IAttribute): attribute is ILocalizedAttribute {
	return attribute.localizable === true
}
import { Types } from "mongoose";

type attributeType = 'string' | 'number' | 'boolean'

export interface IAttribute {
	
	localized: boolean
	type: attributeType
	value: any

	isLocalized: () => boolean
	getType: () => attributeType

	getValue: () => any
	setValue: (value: any) => void 
}

function isBaseValue (value: any) {

}

class Attribute implements IAttribute {
	localized: boolean
	type: attributeType
	value: any

	isLocalized = () => this.localized
	getType = () => this.type

	getValue = (locale?: string) => {
		if (this.isLocalized) {

		} else {

		}
	}
	setValue: (value: any) => void 
}

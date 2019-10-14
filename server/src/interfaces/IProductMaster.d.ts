import { IProduct, IProductVariant, IObjectAttributeDefinition } from '.'

export interface IProductMaster extends IProduct {
	type: 'master'
	variantProducts: IProductVariant[]
	variationAttributes: IObjectAttributeDefinition[]

	// ==== add ====
	addVariationAttribute: (OAD: IObjectAttributeDefinition) => Promise<void>
	addVariant: (variant: IProductVariant) => Promise<void>
	
	// ==== remove ====
	removeVariationAttribute: (OAD: IObjectAttributeDefinition) => Promise<void>
	removeVariant: (variant: IProductVariant) => Promise<void>
}
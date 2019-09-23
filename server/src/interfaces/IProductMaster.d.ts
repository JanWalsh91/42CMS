import { IProduct, IProductVariant, IObjectAttributeDefinition } from '.'

export interface IProductMaster extends IProduct {
	type: 'master'
	variantProducts: IProductVariant[]
	variationAttributes: IObjectAttributeDefinition[]

	// methods
	addVariationAttribute: (OAD: IObjectAttributeDefinition) => Promise<void>
	removeVariationAttribute: (OAD: IObjectAttributeDefinition) => Promise<void>
	addVariant: (variant: IProductVariant) => Promise<void>
	removeVariant: (variant: IProductVariant) => Promise<void>
}
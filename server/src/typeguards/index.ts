import { IExtensibleObject, IProduct, IProductMaster, IProductVariant } from '../interfaces'

export function isExtensibleObject(obj: any): obj is IExtensibleObject {
	return 'custom' in obj && obj.custom !== undefined
}

export function isMasterProduct(product: IProduct): product is IProductMaster {
	return product.isMaster()
}

export function isVariantProduct(product: IProduct): product is IProductVariant {
	return product.isVariant()
} 

export function isBasicProduct(product: IProduct): product is IProduct {
	return product.isBasic()
} 
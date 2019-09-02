import { IProduct, IProductVariant } from '.'

export interface IProductMaster extends IProduct {
	variantProducts: IProductVariant[],
}
import { IProduct, IProductMaster } from '.'

export interface IProductVariant extends IProduct {
	masterProduct: IProductMaster,
	variationAttributes: string[],
}
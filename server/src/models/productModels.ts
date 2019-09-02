import { model, Model } from 'mongoose'

import { IProduct, IProductMaster, IProductVariant } from '../interfaces' 
import { productSchema, productMasterSchema, productVariantSchema } from '../schemas'

const Product: Model<IProduct> = model<IProduct>('Product', productSchema)
const ProductMaster: Model<IProductMaster> = Product.discriminator<IProductMaster>('ProductMaster', productMasterSchema)
const ProductVariant: Model<IProductVariant> = Product.discriminator<IProductVariant>('ProductVariant', productVariantSchema)

export {
	Product,
	ProductMaster,
	ProductVariant,
}
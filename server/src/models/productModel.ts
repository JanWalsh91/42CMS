import { model, Model } from 'mongoose'

import { IProduct } from '../interfaces/' 
import { productSchema } from '../schemas'

export const Product: Model<IProduct> = model<IProduct>('Product', productSchema)

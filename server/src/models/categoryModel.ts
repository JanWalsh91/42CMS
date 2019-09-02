import { model, Model } from 'mongoose'

import { ICategory } from '../interfaces' 
import { categorySchema } from '../schemas'

export const Category: Model<ICategory> = model<ICategory>('Category', categorySchema);

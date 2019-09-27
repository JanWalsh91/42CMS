import { model, Model } from 'mongoose'

import { IImage } from '../interfaces'
import { imageSchema } from '../schemas'

export const Image: Model<IImage> = model<IImage>('Image', imageSchema)
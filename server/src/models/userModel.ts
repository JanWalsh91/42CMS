import { model, Model }  from 'mongoose'

import { IUser } from '../interfaces'
import { userSchema } from '../schemas'

export const User: Model<IUser> = model('User', userSchema)
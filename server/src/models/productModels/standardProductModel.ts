import { Document, Schema, Model, model } from "mongoose";

class StandardProductClass {
	
}

export interface IStandardProduct extends Document {
	id: string,
	name: string,
}

export const StandardProductSchema = new Schema({

}).loadClass(StandardProductClass)

export const Product: Model<IStandardProduct> =
	model<IStandardProduct>('StandardProduct', StandardProductSchema)
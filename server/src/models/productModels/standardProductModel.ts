import { Document, Schema, Model, model } from "mongoose";

export interface IStandardProduct extends Document {
	id: string,
	name: string,
}

const StandardProductSchema = new Schema({

})

StandardProductSchema.methods = {

}

export const Product: Model<IStandardProduct> =
	model<IStandardProduct>('StandardProduct', StandardProductSchema)
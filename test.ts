import * as mongoose from 'mongoose'
import { Schema, Model, model, Document } from 'mongoose';

// ========= Product ==========

interface IProduct extends Document {
	id: string
	getId: () => string
}

const ProductSchema = new Schema({
	id: { type: String }
}, { discriminatorKey: 'type' })

ProductSchema.methods = {
	getId: function(this: IProduct): string {
		return this.id
	}
}

const Product: Model<IProduct> =
	model<IProduct>('Product', ProductSchema)

// ========= Variant =========

interface IVariationProduct extends IProduct {
	sku: string,
	getSku: () => string
}

const VariationProductSchema = new Schema({
	sku: { type: String }
})

VariationProductSchema.methods = {
	getSku: function(this: IVariationProduct): string {
		return this.sku
	}
}

const VariationProduct = Product.discriminator<IVariationProduct>('VariationProduct', VariationProductSchema)
// ========= Master =========

interface IMasterProduct extends IProduct {
	variantProducts: IVariationProduct['_id']
}

const MasterProductSchema = new Schema({
	variantProducts: [{
		type: Schema.Types.ObjectId,
		ref: 'VariantProduct'
	}]
})

const MasterProduct = Product.discriminator<IMasterProduct>('MasterProduct', MasterProductSchema)


// const MasterProduct: Model<IMasterProduct> =
// 	model<IMasterProduct>('MasterProduct', MasterProductSchema)

// const VariantProduct: Model<IVariantProduct> =
// 	model<IVariantProduct>('VariantProduct', VariationProductSchema)


/// test

mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb://127.0.0.1:27017/MYDB', { useNewUrlParser: true })
let db = mongoose.connection
// mongoose.set('debug', true)
db.on('error', err => {
	console.log('err: ', err)
})


async function test() {
	let v: IVariationProduct = new VariationProduct({
		id: 'testid',
		sku: 'testsku'
	})
	let m: IMasterProduct = new MasterProduct({
		id: 'testid',
		sku: 'testsku'
	})
	await m.save()
	await v.save()
	console.log(v)
	console.log(m)
	process.exit()
}

test()

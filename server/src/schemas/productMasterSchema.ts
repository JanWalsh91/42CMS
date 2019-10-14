import { Schema } from 'mongoose'

import { IProductMaster, IObjectAttributeDefinition, IProductVariant } from '../interfaces'
import { ValidationError } from '../utils'

const productMasterSchema = new Schema({
	type: {
		type: String,
		enum: 'master',
		default: 'master'
	},
	variantProducts: [{
		type: Schema.Types.ObjectId,
		ref: 'ProductVariant',
	}],
	variationAttributes: [{
		type: Schema.Types.ObjectId,
		ref: 'ObjectAttributeDefinition',
		autopopulate: true,
	}]
})

productMasterSchema.methods = {
	addVariationAttribute: async function (this: IProductMaster, OAD: IObjectAttributeDefinition): Promise<void> {
		await this.populate('variationAttributes').execPopulate()
		if (this.variationAttributes.find(x => x.path == OAD.path)) {
			throw new ValidationError(`${OAD.path} is already a variation attribute`)
		} else {
			this.variationAttributes.push(OAD)
			this.markModified('variationAttributes')
		}
	},
	removeVariationAttribute: async function (this: IProductMaster, OAD: IObjectAttributeDefinition): Promise<void> {
		await this.populate('variationAttributes').execPopulate()
		if (this.variationAttributes.find(x => x.path == OAD.path)) {
			this.variationAttributes = this.variationAttributes.filter(x => x.path != OAD.path)
			this.markModified('variationAttributes')
		} else {
			throw new ValidationError(`Attribute ${OAD.path} does not exist on this product`)
		}
	},
	addVariant: async function(this: IProductMaster, variant: IProductVariant): Promise<void> {
		await this.populate('variantProducts').execPopulate()
		if (this.variantProducts.find(x => x.id == variant.id)) {
			throw new ValidationError(`Variant ${variant.id} already in master product variant list`)
		} else {
			this.variantProducts.push(variant)
			this.markModified('variantProducts')
		}
	},
	removeVariant: async function(this: IProductMaster, variant: IProductVariant): Promise<void> {
		await this.populate('variantProducts').execPopulate()
		if (this.variantProducts.find(x => x.id == variant.id)) {
			this.variantProducts = this.variantProducts.filter(x => x.id != variant.id)
			this.markModified('variantProducts')
		} else {
			throw new ValidationError(`Variant ${variant.id} not in master product variant list`)
		}
	}
}

productMasterSchema.plugin(require('mongoose-autopopulate'))

export {
	productMasterSchema
}
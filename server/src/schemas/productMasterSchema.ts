import { Schema } from 'mongoose'
import { IProductMaster, IObjectAttributeDefinition, IProductVariant } from '../interfaces';
import chalk from 'chalk';
import { ValidationError } from '../utils';

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
		console.log(chalk.magenta(`[MasterProductModel.addVariationAttribute]`))
		let x = await this.getObjectTypeDefinition()
		console.log(x)
		await this.populate('variationAttributes').execPopulate()
		if (this.variationAttributes.find(x => x.path == OAD.path)) {
			console.log(chalk.yellow(`${OAD.path} is already a variation attribute`))
			return 
		}
		this.variationAttributes.push(OAD)
	},
	removeVariationAttribute: async function (this: IProductMaster, OAD: IObjectAttributeDefinition): Promise<void> {
		console.log(chalk.magenta(`[MasterProductModel.removeVariationAttribute]`))
		await this.populate('variationAttributes').execPopulate()
		if (this.variationAttributes.find(x => x.path == OAD.path)) {
			this.variationAttributes = this.variationAttributes.filter(x => x.path != OAD.path)
			this.markModified('variationAttributes')
			return 
		} else {
			throw new ValidationError(`Attribute ${OAD.path} does not exist on this product`)
		}
	},
	addVariant: async function(this: IProductMaster, variant: IProductVariant): Promise<void> {
		console.log(chalk.magenta(`[MasterProductModel.addVariant]`))
		await this.populate('variantProducts').execPopulate()
		if (this.variantProducts.find(x => x.id == variant.id)) {
			throw new ValidationError(`Variant ${variant.id} already in master product variant list`)
		} else {
			this.variantProducts.push(variant)
			this.markModified('variantProducts')
		}
	},
	removeVariant: async function(this: IProductMaster, variant: IProductVariant): Promise<void> {
		console.log(chalk.magenta(`[MasterProductModel.removeVariant]`))
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
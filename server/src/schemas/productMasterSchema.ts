import { Schema } from 'mongoose'
import { IProductMaster, IObjectAttributeDefinition } from '../interfaces';
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
		ref: 'VariantProduct',
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
}

productMasterSchema.plugin(require('mongoose-autopopulate'))

export {
	productMasterSchema
}
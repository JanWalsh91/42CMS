import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct, updateObjectAttributeDefinition, updateObjectTypeDefinition  } from './common'

import { User, Category, Catalog, Product, ObjectTypeDefinition, LocalizableAttribute } from '../src/models'
import { IUser, IProduct, ICatalog, ICategory, ILocalizableAttribute } from '../src/interfaces'
import app from '../src/app'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { localeCode } from '../src/types'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;
let catalog: any = {}
let category: any = {}
let product: any = {}

const newPath: string = 'test'
const newValue: string = 'my value'

describe('Localizable Attribute', function() {
	before(async () => {
		// wait for server to init async tasks
		await app.ready
		// Clear database
		await clearDataBase()
		await app.ready
		// Create user
		await createUser(userData)
		// Create catalog
		ret = await createCatalog(catalogData.id, {master: true})
		catalog = ret.body
		// Create catalog
		ret = await createCategory(catalogData.id, categoryData.id)
		category = ret.body
	})

	beforeEach(async function() {
		await clearDataBase(Product, ObjectTypeDefinition, LocalizableAttribute)
		// wait for server to init async tasks
		await app.ready
	})

	describe('Create Custom Attributes', () => {
		it('Should create a custom attribute when creating a new product', async() => {
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', type: 'string', path: newPath
				}
			})
			ret.status.should.eq(OK)
			ret = await createProduct(catalogData.id, productData.id)
			ret.status.should.eq(OK)
			let product: IProduct = await Product.findOne({id: productData.id}).exec()
			// New attribute should exist on product
			product.custom.get(newPath).should.exist
		})
		it('Should create a custom attribute on an existing product', async() => {
			ret = await createProduct(catalogData.id, productData.id)
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', type: 'string', path: newPath
				}
			})
			ret.status.should.eq(OK)
			let product: IProduct = await Product.findOne({id: productData.id}).exec()
			// New attribute should exist on product
			product.custom.get(newPath).should.exist
		})
	})
	describe('$set Custom Attributes', () => {
		it('Should update a custom attribute', async() => {
			ret = await createProduct(catalogData.id, productData.id)
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', type: 'string', path: newPath
				}
			})
			ret = await updateProduct(productData.id, {
				[newPath]: { op: '$set', value: newValue }
			})
			ret.status.should.eq(OK)
			let product: IProduct = await Product.findOne({id: productData.id}).exec()

			product.custom.get(newPath).should.exist
			product.custom.get(newPath).value.get('default').should.eq(newValue)					
		})
	})
	describe('Change Custom Attribute Type', () => {
		it('Should change attribute type and reset values', async() => {
			ret = await createProduct(catalogData.id, productData.id)
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', type: 'string', path: newPath
				}
			})
			ret = await updateProduct(productData.id, {
				[newPath]: { op: '$set', value: newValue }
			})
			ret = await updateObjectAttributeDefinition('Product', newPath, {
				type: { op: '$set', value: 'number' }
			})
			let product: IProduct = await Product.findOne({id: productData.id}).exec()

			expect(product.custom.get(newPath).value.get('default')).eq(null)
			let newNum: number = 10
			ret = await updateProduct(productData.id, {
				[newPath]: { op: '$set', value: newNum }
			})
			
			product = await Product.findOne({id: productData.id}).exec()
			product.custom.get(newPath).value.get('default').should.eq(newNum)					
		})
	})
	describe('Delete Custom Attribute Type', () => {
		it('Should remove the attribute', async() => {
			ret = await createProduct(catalogData.id, productData.id)
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', type: 'string', path: newPath
				}
			})
			ret = await updateProduct(productData.id, {
				[newPath]: { op: '$set', value: newValue }
			})
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$remove', path: newPath
				}
			})
			let product: IProduct = await Product.findOne({id: productData.id}).exec()
			expect(product.custom.get(newPath)).eq(undefined)
		})
	})

	describe('Delete custom object', () => {
		it('Should delete attribute when product is deleted', async() => {
			// create product
			ret = await createProduct(catalogData.id, productData.id)
			// create attribute definition
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', type: 'string', path: newPath
				}
			})
			// save attribute _id
			ret = await getProduct(productData.id)
			let attributeId: string = ret.body.custom.test._id
			console.log('attribiute id:', attributeId)
			// delete product
			ret = await deleteProduct(productData.id)
			// get attribute
			let attribute: ILocalizableAttribute = await LocalizableAttribute.findById(attributeId).exec()
			expect(attribute).to.not.exist
		})
	})
})
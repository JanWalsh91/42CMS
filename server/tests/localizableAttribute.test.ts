import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct, updateObjectAttributeDefinition, updateObjectTypeDefinition, updateGlobalSettings, placeholderImages, uploadImage, deleteImage  } from './common'

import { User, Category, Catalog, Product, ObjectTypeDefinition, LocalizableAttribute } from '../src/models'
import { IUser, IProduct, ICatalog, ICategory, ILocalizableAttribute } from '../src/interfaces'
import app from '../src/app'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { localeCode } from '../src/types'
import { patchOperation } from '../src/utils';
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;
let catalog: any = {}
let category: any = {}
let product: any = {}

const newPath: string = 'test'
const newValue: string = 'my value'

describe.only('Localizable Attribute', function() {
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
		await app.ready
		await clearDataBase(Product, ObjectTypeDefinition, LocalizableAttribute)
		// Set locales as available
		ret = await updateGlobalSettings({
			locale: [
				{ op: '$add', value: 'fr_FR' },
				{ op: '$add', value: 'fr' }
			]
		})
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
			
			// New attribute should exist on product
			const product: IProduct = await Product.findOne({id: productData.id}).exec()
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
			// New attribute should exist on product
			const product: IProduct = await Product.findOne({id: productData.id}).exec()
			product.custom.get(newPath).should.exist
		})
		describe('Should fail if ...', () => {
			it('... path is already used / attribute already exists', async() => {
				ret = await createProduct(catalogData.id, productData.id)
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', type: 'string', path: newPath
					}
				})
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', type: 'string', path: newPath
					}
				})
				ret.status.should.eq(BAD_REQUEST)
				// New attribute should exist on product
				const product: IProduct = await Product.findOne({id: productData.id}).exec()
				product.custom.get(newPath).should.exist
			})
			it('... type not available', async() => {
				ret = await createProduct(catalogData.id, productData.id)
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', type: 'stringy', path: newPath
					}
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... type is invalid', async() => {
				ret = await createProduct(catalogData.id, productData.id)
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', type: {type: 'type'}, path: newPath
					}
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			describe('... path is invalid', () => {
				it('... as object ', async() => {
					ret = await createProduct(catalogData.id, productData.id)
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', type: 'string', path: {text: 'i am path'}
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				
				it('... contains dot', async() => {
					ret = await createProduct(catalogData.id, productData.id)
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', type: 'string', path: 'invalid.path'
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				
				it('... contains slash', async() => {
					ret = await createProduct(catalogData.id, productData.id)
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', type: 'string', path: 'invalid/path'
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				
				it('... contains space', async() => {
					ret = await createProduct(catalogData.id, productData.id)
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', type: 'string', path: 'invalid path'
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
			})
		})
	})

	describe('Delete Custom attribute', () => {
		it('Should delete a custom attribute', async() => {
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', type: 'string', path: newPath
				}
			})
			ret = await createProduct(catalogData.id, productData.id)
			ret = await updateProduct(productData.id, {
				[newPath]: { op: '$set', value: 'my string' }
			})
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$remove', path: newPath
				}
			})
			ret.status.should.eq(OK)

			// New attribute should not exist on product
			const product: IProduct = await Product.findOne({id: productData.id}).exec()
			expect(product.custom.get(newPath)).to.not.exist

		})
		describe('Should fail if ...', () => {
			it('... attribute is a system attribute', async() => {
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$remove', path: 'name'
					}
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... attribute does not exist', async() => {
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$remove', path: newPath
					}
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... attribute is invalid', async() => {
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$remove', path: ['thisIsPath']
					}
				})
				ret.status.should.eq(BAD_REQUEST)
			})
		})
	})

	const imgid: string = 'myimage'

	const testParams: {path: string, type: string, value: any, badValue: any | any[], op: patchOperation }[] = [
		{ path: 'test1', type: 'string', value: 'my value', badValue: 10, op: '$set' },
		{ path: 'test2', type: 'number', value: 20, badValue: 'test', op: '$set' },
		{ path: 'test3', type: 'boolean', value: true, badValue: 'string', op: '$set' },
		{ path: 'test4', type: 'html', value: '<div>Hello</div>', badValue: false , op: '$set' },
		{ path: 'test5', type: 'date', value: (new Date()).toISOString(), badValue: 'this is not a date', op: '$set' },
		{ path: 'test6', type: 'string[]', value: 'my value', badValue: 10, op: '$add' },
		{ path: 'test7', type: 'string[]', value: ['testing'], badValue: [10, 20, 30], op: '$set' },
		{ path: 'test8', type: 'image', value: imgid, badValue: 'asdfadf', op: '$set' },
	]

	describe('Attribute Types', () => {
		for (let params of testParams) {
			it(`Type: ${params.type}`, async () => {
				console.log(chalk.cyan(`=== [${params.type}] Create OTD ===`))
				ret = await updateObjectTypeDefinition('Product', { objectAttributeDefinitions: { op: '$add', type: params.type, path: params.path } })
				ret.status.should.eq(OK)

				console.log(chalk.cyan(`=== [${params.type}] Create Product ===`))
				ret = await createProduct(catalogData.id, productData.id)
				ret.status.should.eq(OK)

				if (params.type == 'image') {
					ret = await uploadImage(placeholderImages[0], imgid)
					ret.status.should.eq(OK)
				}

				console.log(chalk.cyan(`=== [${params.type}] Assign Value ===`))
				ret = await updateProduct(productData.id, { [params.path]: { op: params.op, value: params.value } })
				ret.status.should.eq(OK)
				let product: IProduct = await Product.findOne({id: productData.id}).exec()
				product.custom.get(params.path).should.exist
				if (params.type.includes('[]')) {
					expect(product.custom.get(params.path).value.get('default').find(x => x == params.value)).to.exist					
				} else {
					product.custom.get(params.path).value.get('default').should.eq(params.value)
				}

				console.log(chalk.cyan(`=== [${params.type}] Assign Value To Locale ===`))
				const locale: localeCode = 'fr_FR'
				ret = await updateProduct(productData.id, { [params.path]: { op: params.op, value: params.value, locale } })
				product = await Product.findOne({id: productData.id}).exec()
				product.custom.get(params.path).should.exist
				if (params.type.includes('[]')) {
					expect(product.custom.get(params.path).value.get(locale).find(x => x == params.value)).to.exist					
				} else {
					product.custom.get(params.path).value.get(locale).should.eq(params.value)
				}

				console.log(chalk.cyan(`=== [${params.type}] Assign Invalid Value To Locale ===`))
				ret = await updateProduct(productData.id, { [params.path]: { op: params.op, value: params.badValue } })
				ret.status.should.not.eq(OK)
				product = await Product.findOne({id: productData.id}).exec()
				product.custom.get(params.path).should.exist
				if (params.type.includes('[]')) {
					expect(product.custom.get(params.path).value.get('default').find(x => x == params.badValue)).to.not.exist					
				} else {
					product.custom.get(params.path).value.get('default').should.not.eq(params.badValue)
				}
				if (params.type == 'image') {
					await deleteImage(imgid)
				}
			})
		}
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
		describe('Should fail if ...', () => {
			it('... is invalid value', async() => {
				ret = await createProduct(catalogData.id, productData.id)
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', type: 'string', path: newPath
					}
				})
				ret = await updateProduct(productData.id, {
					[newPath]: { op: '$set', value: 500 }
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... is invalid operation', async() => {
				ret = await createProduct(catalogData.id, productData.id)
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', type: 'string', path: newPath
					}
				})
				ret = await updateProduct(productData.id, {
					[newPath]: { op: '$add', value: '500' }
				})
				ret.status.should.eq(BAD_REQUEST)
			})
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
	describe('Delete Extensible Object', () => {
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
			// delete product
			ret = await deleteProduct(productData.id)
			// get attribute
			let attribute: ILocalizableAttribute = await LocalizableAttribute.findById(attributeId).exec()
			expect(attribute).to.not.exist
		})
	})
})
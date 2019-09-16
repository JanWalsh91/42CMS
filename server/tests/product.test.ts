import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct, updateObjectAttributeDefinition, updateObjectTypeDefinition  } from './common';

import { User, Category, Catalog, Product, ObjectTypeDefinition } from '../src/models'
import { IUser, IProduct, ICatalog, ICategory } from '../src/interfaces'
import app from '../src/app'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { localeCode } from '../src/types';
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;
let catalog: any = {}
let category: any = {}
let product: any = {}

describe('Product', function() {
	before(async () => {
		// wait for server to init async tasks
		await app.ready
		// Clear database
		await clearDataBase()
		// Create user
		await createUser(userData)
		await app.ready
	})

	beforeEach(async function() {
		await clearDataBase(Category, Catalog, Product, ObjectTypeDefinition)
		// Create catalog
		ret = await createCatalog(catalogData.id, {master: true})
		catalog = ret.body
		// Create catalog
		ret = await createCategory(catalogData.id, categoryData.id)
		category = ret.body
		// wait for server to init async tasks
		await app.ready
	})

	describe('Create', () => {
		it('Should create a product', async() => {
			ret = await createProduct(catalogData.id, productData.id)
			ret.status.should.equal(OK)

			// Product should exist
			const product: IProduct = await Product.findOne({id: productData.id}).populate([
				{path: 'masterCatalog'},
				{path: 'assignedCatalogs'},
				{path: 'assignedCategoriesByCatalog.catalog'},
				{path: 'primaryCategoryByCatalog.catalog'},
			]).exec()

			// Should set product.masterCatalog
			product.masterCatalog.id.should.eq(catalogData.id)
			// Should set product.assignedCatalogs
			expect(product.assignedCatalogs.find(x => x.id == catalogData.id)).to.exist
			// Should set product.assignedCategoriesByCatalog
			expect(product.assignedCategoriesByCatalog.find(x => x.catalog.id == catalogData.id)).to.exist
			// Should set product.primaryCategoryByCatalog
			expect(product.primaryCategoryByCatalog.find(x => x.catalog.id == catalogData.id)).to.exist
			
			// Master Catalog should have product
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('products').exec()
			catalog.products.find(x => x.id == productData.id).should.exist

		})
		describe('Should fail to create a product if ...', () => {
			it('the product id is not unique', async() => {
				await createProduct(catalogData.id, productData.id)
				ret = await createProduct(catalogData.id, productData.id)
				ret.status.should.equal(BAD_REQUEST)
			})
			it('the catalog does not exist', async() => {
				ret = await createProduct('mysupercatalog', productData.id)
				ret.status.should.equal(NOT_FOUND)
			})
			it('the catalog is not a master catalog', async() => {
				await createCatalog(catalogData.id + '2', {master: false})
				ret = await createProduct(catalogData.id + '2', productData.id)
				ret.status.should.equal(BAD_REQUEST)	
			})
		})
	})

	describe('Get Product', () => {
		it('Should get a product', async() => {
			ret = await createProduct(catalogData.id, productData.id)
			ret.should.have.status(OK)
			ret = await getProduct(productData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(productData.id)
		})
		describe('Should fail if ...', () => {
			it('Product does not exist', async () => {
				ret = await getProduct(productData.id)
				ret.should.have.status(NOT_FOUND)				
			})
			it('User is not authenticated', async() => {
				await logout()
				ret = await getProduct(productData.id)
				ret.should.have.status(UNAUTHORIZED)
				await login(userData)
			})
		})
	})

	describe('Get all Products', () => {
		it('Should get all Products', async() => {
			await createProduct(catalogData.id, 'id1', { name: 'name1' })
			await createProduct(catalogData.id, 'id2', { name: 'name2' })
			await createProduct(catalogData.id, 'id3', { name: 'name3' })
			ret = await getAllProducts()
			ret.body.length.should.equal(3)
			ret.should.have.status(OK)
		})
		describe('Should fail if ...', () => {
			it('User is not authenticated', async() => {
				await logout()
				ret = await getAllProducts()
				ret.should.have.status(UNAUTHORIZED)
				await login(userData)
			})
		})
	})

	describe.only('Update Product', () => {
		const newName: string = 'newProductName'
		const newId: string = 'newProductId'

		it('Should update Product name and ID', async() => {
			await createProduct(catalogData.id, productData.id)
	
			ret = await updateProduct(productData.id, {
				name: { op: '$set', value: newName },
				id: { op: '$set', value: newId },
			})
			ret.status.should.eq(OK)
	
			// Category's name and id should be updated
			const product: IProduct = await Product.findOne({id: newId})
			product.name.value.get('default').should.eq(newName)
			product.id.should.eq(newId)
		})

		describe('Assign to Catalogs', () => {
			const catId1 = 'catId1'

			it('Should assign a Product to a Catalog', async() => {
				await createProduct(catalogData.id, productData.id)
				await createCatalog(catId1)
				ret = await updateProduct(productData.id, {
					assignedCatalogs: { op: '$add', value: catId1 }
				})
				ret.status.should.eq(OK)

				const product: IProduct = await Product.findOne({id: productData.id}).populate('assignedCatalogs')
				const catalog: ICatalog = await Catalog.findOne({id: catId1}).populate('products')
				// Product should have catalog in assignedCatalogs
				product.assignedCatalogs.find(x => x.id == catId1).should.exist
				// Catalog should have product in products
				catalog.products.find(x => x.id == productData.id).should.exist
			})
			it('Should unassign a Product from a Catalog', async() => {
				await createProduct(catalogData.id, productData.id)
				await createCatalog(catId1)
				await updateProduct(productData.id, {
					assignedCatalogs: { op: '$add', value: catId1 }
				})
				ret = await updateProduct(productData.id, {
					assignedCatalogs: { op: '$remove', value: catId1 }
				})
				ret.status.should.eq(OK)

				const product: IProduct = await Product.findOne({id: productData.id}).populate('assignedCatalogs')
				const catalog: ICatalog = await Catalog.findOne({id: catId1}).populate('products')
				// Product should have catalog in assignedCatalogs
				expect(product.assignedCatalogs.find(x => x.id == catId1)).to.not.exist
				// Catalog should have product in products
				expect(catalog.products.find(x => x.id == productData.id)).to.not.exist
			})
			describe('Should fail if ...', () => {
				it('Catalog does not exist')
				it('Catalog is a master Catalog')
				it('User is not authenticated')
			})
		})

		describe('Assign Categories by Catalog', () => {
			it('Should add a category by Catalog', async() => {
				await createProduct(catalogData.id, productData.id)
				ret = await updateProduct(productData.id, {
					assignedCategoriesByCatalog: {
						op: '$add',
						value: categoryData.id,
						catalog: catalogData.id,
					}
				})
				ret.status.should.eq(OK)
				
				// Should update product.assignedCategoriesByCatalog
				const product: IProduct = await Product.findOne({id: productData.id}).populate([
					{path: 'assignedCatalogs'},
					{path: 'assignedCategoriesByCatalog.catalog'},
					{path: 'assignedCategoriesByCatalog.categories'},
				])
				product.assignedCategoriesByCatalog.find(x => x.catalog.id == catalogData.id).categories.find(x => x.id == categoryData.id).should.exist
				
				// Should update category.products
				const category: ICategory = await Category.findOne({id: categoryData.id}).populate('products')
				category.products.find(x => x.id == product.id).should.exist
			})
			it('Should remove a category by Catalog', async() => {
				await createProduct(catalogData.id, productData.id)
				await updateProduct(productData.id, {
					assignedCategoriesByCatalog: {
						op: '$add',
						value: categoryData.id,
						catalog: catalogData.id,
					}
				})
				ret = await updateProduct(productData.id, {
					assignedCategoriesByCatalog: {
						op: '$remove',
						value: categoryData.id,
						catalog: catalogData.id,
					}
				})
				ret.status.should.eq(OK)

				// Should update product.assignedCategoriesByCatalog
				const product: IProduct = await Product.findOne({id: productData.id}).populate([
					{path: 'assignedCatalogs'},
					{path: 'assignedCategoriesByCatalog.catalog'},
					{path: 'assignedCategoriesByCatalog.categories'},
				])
				expect(product.assignedCategoriesByCatalog.find(x => x.catalog.id == catalogData.id).categories.find(x => x.id == categoryData.id)).to.not.exist
			
				// Should update category.products
				const category: ICategory = await Category.findOne({id: categoryData.id}).populate('products')
				expect(category.products.find(x => x.id == product.id)).to.not.exist
			})
		})

		describe('Set Primary Category by Catalog', () => {
			it('Should set a primary category for a catalog', async() => {
				await createProduct(catalogData.id, productData.id)
				ret = await updateProduct(productData.id, {
					primaryCategoryByCatalog: {
						op: '$set',
						value: categoryData.id,
						catalog: catalogData.id,
					}
				})
				ret.status.should.eq(OK)

				// Product should have primary Category by Catalog set correctly
				const product: IProduct = await Product.findOne({id: productData.id}).populate([
					{path: 'primaryCategoryByCatalog.catalog'},
					{path: 'primaryCategoryByCatalog.category'},
				])
				expect(product.primaryCategoryByCatalog.find(x => x.catalog.id == catalogData.id).category.id).eq(categoryData.id)
			})
		})

		// done in order sent
		describe.skip('Check order of udpates', () => {
			it('==', async() => {
				await createProduct(catalogData.id, productData.id)
				ret = await updateProduct(productData.id, {
					name: {
						op: '$set',
						value: 'newName'
					},
					id: {
						op: '$set',
						value: 'newId'
					},
					primaryCategoryByCatalog: {
						op: '$set',
						value: categoryData.id,
						catalog: catalogData.id,
					}
				})
			})
		})

		describe('Update description', () => {
			it('Should $set description when you pass a locale', async() => {
				console.log('start test')
				const locale: localeCode = 'en'
				const newDescription: string = 'This product is amazing'
				await createProduct(catalogData.id, productData.id)

				ret = await updateProduct(productData.id, {
					description: { op: '$set', value: newDescription, locale },
				})
				ret.status.should.eq(OK)

				// Product description should be updated
				const product: IProduct = await Product.findOne({id: productData.id})
				console.log('description: ', product.description)
				product.description.value.get(locale).should.eq(newDescription)
			})

			it('Should $set description on default when you pass no locale', async() => {
				console.log('start test')
				const newDescription: string = 'This product is amazing'
				await createProduct(catalogData.id, productData.id)
				
				ret = await updateProduct(productData.id, {
					description: { op: '$set', value: newDescription },
				})
				ret.status.should.eq(OK)

				// Product description should be updated
				const product: IProduct = await Product.findOne({id: productData.id})
				product.description.value.get('default').should.eq(newDescription)
			})
		})

		describe('Custom attributes', () => {
			const newPath: string = 'test'
			const newValue: string = 'my value'
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
					product.custom.get(newPath).should.exist
				})
				it('Should create a custom attribute on a created product', async() => {
					ret = await createProduct(catalogData.id, productData.id)
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', type: 'string', path: newPath
						}
					})
					ret.status.should.eq(OK)
					let product: IProduct = await Product.findOne({id: productData.id}).exec()
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
					console.log('product', product)
					console.log('product.custom', product.custom)

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
					console.log('product', product)
					console.log('product.custom', product.custom)
					console.log('product.custom.get(newPath)', product.custom.get(newPath))
					console.log('product.custom.get(newPath).value', product.custom.get(newPath).value)
					console.log('product.custom.get(newPath).value.get(default)', product.custom.get(newPath).value.get('default'))

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
				it.only('Should remove the attribute', async() => {
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
					console.log('product', product)
					console.log('product.custom', product.custom)
					console.log('product.custom.get(newPath)', product.custom.get(newPath))
					console.log('product.custom.get(newPath).value', product.custom.get(newPath).value)
					console.log('product.custom.get(newPath).value.get(default)', product.custom.get(newPath).value.get('default'))

					expect(product.custom.get(newPath)).eq(null)
				})
			})
		})
	})

	describe('Delete product', () => {
		it('Should delete the product', async() => {
			const catid2: string = 'catid2';
			await createProduct(catalogData.id, productData.id)
			await createCategory(catalogData.id, catid2)
			
			ret = await updateProduct(productData.id, {
				// Set primary category
				primaryCategoryByCatalog: {
					op: '$set',
					value: category.id,
					catalog: catalogData.id
				},
				// Set other category
				assignedCategoriesByCatalog: {
					op: '$add',
					value: catid2,
					catalog: catalogData.id
				}
			})


			ret = await deleteProduct(productData.id)
			ret.should.have.status(OK)

			// Product should not exist
			const product: IProduct = await Product.findOne({id: productData.id})
			expect(product).to.not.exist
			
			// Catalog should not have product
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('products')
			catalog.products.should.have.length(0)

			// Categories should both not have product
			await Promise.all([categoryData.id, catid2].map(async catid => {
				const category: ICategory = await Category.findOne({id: catid}).populate('products')
				expect(category.products.find(x => x.id == productData.id)).to.not.exist
			}))
		})
	})
})
import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData, updateProduct, getProduct, logout, login, getAllProducts, deleteProduct, updateObjectTypeDefinition, agent  } from './common'

import { User, Category, Catalog, Product, ObjectTypeDefinition } from '../src/models'
import { IUser, IProduct, ICatalog, ICategory, IProductMaster } from '../src/interfaces'
import app from '../src/app'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { localeCode } from '../src/types'
import { isVariantProduct } from '../src/typeguards'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;
let catalog: any = {}
let category: any = {}
let product: any = {}

const variationAttributePath: string = 'size'
const variationAttributeType: string = 'number'
const masterId = 'tshirt'
const variantId1 = 'tshirt1'

describe('Product', function() {
	before(async () => {
		await app.ready
		// Clear database
		await clearDataBase()
		// Wait for server to init async tasks
		await app.ready
	})

	beforeEach(async function() {
		await app.ready
		await clearDataBase(Category, Catalog, Product, ObjectTypeDefinition, User)
		await app.ready

		// Create User
		ret = await createUser(userData)
		ret.status.should.eq(OK)
		// Create catalog
		ret = await createCatalog(catalogData.id, { master: true })
		catalog = ret.body
		// Create category
		ret = await createCategory(catalogData.id, categoryData.id)
		category = ret.body
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
			// Product type should be 'basic'
			expect(product.type).to.eq('basic')

			// Master Catalog should have product
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('products').exec()
			catalog.products.find(x => x.id == productData.id).should.exist

		})
		
		describe('Should fail to create a product if ...', () => {
			it('... the product id is not unique', async() => {
				await createProduct(catalogData.id, productData.id)
				ret = await createProduct(catalogData.id, productData.id)
				ret.status.should.equal(BAD_REQUEST)
			})
			it('... the catalog does not exist', async() => {
				ret = await createProduct('mysupercatalog', productData.id)
				ret.status.should.equal(NOT_FOUND)
			})
			it('... the catalog is not a master catalog', async() => {
				await createCatalog(catalogData.id + '2', { master: false })
				ret = await createProduct(catalogData.id + '2', productData.id)
				ret.status.should.equal(BAD_REQUEST)	
			})
			it('... id is invalid', async() => {
				ret = await agent.post(`/products`).send({
					id: { id: 'invalidid' },
					mastercatalogid: catalogData.id,
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... user is not authenticated', async() => {
				await logout()
				ret = await createProduct(catalogData.id, productData.id)
				ret.status.should.equal(UNAUTHORIZED)
			})
		})
	})

	describe('Master Product', () => {

		describe('Create', () => {
			it('Should create a master product', async() => {
				ret = await createProduct(catalogData.id, productData.id, { type : 'master' })
				ret.status.should.equal(OK)
	
				const product: IProduct = await Product.findOne({id: productData.id}).exec()
				// Product type should be 'master'
				expect(product.type).to.eq('master')
			})
		})
		describe('Add Variant Attribute', () => {
			it('Should add a variant attribute', async() => {
				ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', path: variationAttributePath, type: variationAttributeType
					}
				})
				ret = await updateProduct(productData.id, {
					variationAttributes: {
						op: '$add', value: variationAttributePath
					}
				})
				expect(ret.status).eq(OK)
				const product: IProductMaster = (await Product.findOne({id: productData.id}).populate('variationAttributes').exec()) as IProductMaster
				expect(product.variationAttributes.find(x => x.path == variationAttributePath))
			})
			describe('Should fail if ...', () => {
				it('... attribute is already a variant attribute', async() => {
					ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', path: variationAttributePath, type: variationAttributeType
						}
					})
					ret = await updateProduct(productData.id, {
						variationAttributes: {
							op: '$add', value: variationAttributePath
						}
					})
					ret = await updateProduct(productData.id, {
						variationAttributes: {
							op: '$add', value: variationAttributePath
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				it('... attribute is not a product attribute', async() => {
					ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
					ret = await updateProduct(productData.id, {
						variationAttributes: {
							op: '$add', value: variationAttributePath
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				it.skip(`... editing a variant attribute on master`, async() => {
					ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', path: variationAttributePath, type: variationAttributeType
						}
					})
					ret = await updateProduct(productData.id, {
						[variationAttributePath]: { op: '$set', value: 50 }
					})
					ret.status.should.eq(BAD_REQUEST)
				})
			})
		})
		describe('Remove Variant Attribute', () => {
			it('Should remove a variant attribute', async() => {
				ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', path: variationAttributePath, type: variationAttributeType
					}
				})
				ret = await updateProduct(productData.id, {
					variationAttributes: {
						op: '$add', value: variationAttributePath
					}
				})
				ret = await updateProduct(productData.id, {
					variationAttributes: {
						op: '$remove', value: variationAttributePath
					}
				})
				ret.status.should.eq(OK)
				const product: IProductMaster = (await Product.findOne({id: productData.id}).populate('variationAttributes').exec()) as IProductMaster
				expect(product.variationAttributes.find(x => x.path == variationAttributePath)).to.not.exist
			})
			describe('Should fail if ...', () => {
				it('... attribute is not variant', async() => {
					ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', path: variationAttributePath, type: variationAttributeType
						}
					})
					ret = await updateProduct(productData.id, {
						variationAttributes: {
							op: '$remove', value: variationAttributePath
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				it('... attribute is a system attribute', async() => {
					ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
					ret = await updateProduct(productData.id, {
						variationAttributes: {
							op: '$remove', value: 'description'
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				it('... attribute path is invalid', async() => {
					ret = await createProduct(catalogData.id, productData.id, {type : 'master'})
					ret = await updateObjectTypeDefinition('Product', {
						objectAttributeDefinitions: {
							op: '$add', path: variationAttributePath, type: variationAttributeType
						}
					})
					ret = await updateProduct(productData.id, {
						variationAttributes: {
							op: '$remove', value: null
						}
					})
					ret.status.should.eq(BAD_REQUEST)
				})	
			})
		})
	})

	describe('Variant Product', () => {
		it('Should create a variant product', async() => {
			ret = await createProduct(catalogData.id, masterId, { type : 'master' })
			ret = await updateObjectTypeDefinition('Product', {
				objectAttributeDefinitions: {
					op: '$add', path: variationAttributePath, type: variationAttributeType
				}
			})
			ret = await updateProduct(masterId, {
				variationAttributes: {
					op: '$add', value: variationAttributePath
				}
			})
			ret = await createProduct(catalogData.id, variantId1, {
				type : 'variant',
				[variationAttributePath]: 30,
				masterProduct: masterId,
			})
			expect(ret.status).eq(OK)
			const product: IProduct = await Product.findOne({id: variantId1}).populate('masterProduct')
			// Should be of type variant
			product.type.should.eq('variant')
			if (isVariantProduct(product)) {
				product.custom.get(variationAttributePath).value.get('default').should.eq(30)
				// Should have ref to master
				expect(product.masterProduct).to.exist
				// Master should have ref to variant
				const master: IProductMaster = (await Product.findOne({id: masterId}).populate('variantProducts').exec()) as IProductMaster
				expect(master.variantProducts.find(x => x.id == variantId1)).to.exist
			}
		})
		describe('Should fail if ...', () => {
			it('... variant attributes were not defined', async() => {
				// Create master
				ret = await createProduct(catalogData.id, masterId, { type : 'master' })
				// Create variant
				ret = await createProduct(catalogData.id, variantId1, {
					type : 'variant',
					masterProduct: masterId,
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... variant attributes were not provided', async() => {
				// Create master
				ret = await createProduct(catalogData.id, masterId, { type : 'master' })
				// Create and add variationAttribute
				ret = await updateObjectTypeDefinition('Product', {
					objectAttributeDefinitions: {
						op: '$add', path: variationAttributePath, type: variationAttributeType
					}
				})
				ret = await updateProduct(masterId, {
					variationAttributes: {
						op: '$add', value: variationAttributePath
					}
				})
				// Create variant
				ret = await createProduct(catalogData.id, variantId1, {
					type : 'variant',
					masterProduct: masterId,
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... master product does not exist', async() => {
				ret = await createProduct(catalogData.id, variantId1, {
					type : 'variant',
					[variationAttributePath]: 30,
					masterProduct: masterId + '2',
				})
			})
			it('... master id is invalid', async() => {
				ret = await createProduct(catalogData.id, variantId1, {
					type : 'variant',
					[variationAttributePath]: 30,
					masterProduct: [masterId],
				})
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
			it('... product does not exist', async () => {
				ret = await getProduct(productData.id)
				ret.should.have.status(NOT_FOUND)				
			})
			it('... user is not authenticated', async() => {
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
			await createProduct(catalogData.id, 'id3', { name: 'name3', type: 'master' })
			ret = await getAllProducts()
			ret.body.length.should.equal(3)
			ret.should.have.status(OK)
		})
		describe('Should fail if ...', () => {
			it('... user is not authenticated', async() => {
				await logout()
				ret = await getAllProducts()
				ret.should.have.status(UNAUTHORIZED)
				await login(userData)
			})
		})
	})

	describe('Update Product', () => {
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
				it('... catalog does not exist', async() => {
					await createProduct(catalogData.id + '2', productData.id)
					ret = await updateProduct(productData.id, {
						assignedCatalogs: { op: '$add', value: 'unknowncatalog' }
					})
					ret.status.should.eq(NOT_FOUND)
				})
				it('... catalog is a master Catalog', async() => {
					await createProduct(catalogData.id, productData.id)
					await createCatalog(catId1, { master: true })
					ret = await updateProduct(productData.id, {
						assignedCatalogs: { op: '$add', value: catId1 }
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				it('... user is not authenticated', async() => {
					await createProduct(catalogData.id, productData.id)
					await createCatalog(catId1)
					await logout()
					ret = await updateProduct(productData.id, {
						assignedCatalogs: { op: '$add', value: catId1 }
					})
					ret.status.should.eq(UNAUTHORIZED)
				})
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
			describe('Should fail if ...', () => {
				it('... category does not exist', async() => {
					await createProduct(catalogData.id, productData.id)
					ret = await updateProduct(productData.id, {
						assignedCategoriesByCatalog: {
							op: '$add',
							value: 'invalidcategory',
							catalog: catalogData.id,
						}
					})
					ret.status.should.eq(NOT_FOUND)
				})
				it('... category does not exist in catalog', async() => {
					const category2: string = 'category2'
					const catalog2: string = catalogData.id + '2'
					await createProduct(catalogData.id, productData.id)
					await createCatalog(catalog2)
					await createCategory(catalog2, category2)
					ret = await updateProduct(productData.id, {
						assignedCategoriesByCatalog: {
							op: '$add',
							value: category2,
							catalog: catalog2,
						}
					})
					ret.status.should.eq(NOT_FOUND)
				})
				it('... categoryid is invalid', async() => {
					await createProduct(catalogData.id, productData.id)
					ret = await updateProduct(productData.id, {
						assignedCategoriesByCatalog: {
							op: '$add',
							value: ['invalidcategory'],
							catalog: catalogData.id,
						}
					})
					ret.status.should.eq(NOT_FOUND)
				})
				it('... product is not assigned to catalog', async() => {
					await createProduct(catalogData.id, productData.id)
					await createCatalog('cata2')
					await createCategory('cata2', 'category2')
					ret = await updateProduct(productData.id, {
						assignedCategoriesByCatalog: {
							op: '$add',
							value: 'category2',
							catalog: 'cata2',
						}
					})
					ret.status.should.eq(NOT_FOUND)
				})
				it('... catalog does not exist', async() => {
					await createProduct(catalogData.id, productData.id)
					ret = await updateProduct(productData.id, {
						assignedCategoriesByCatalog: {
							op: '$add',
							value: categoryData.id + '2',
							catalog: catalogData.id,
						}
					})
					ret.status.should.eq(NOT_FOUND)
				})
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

		describe('Update description', () => {
			it('Should $set description when you pass a locale', async() => {
				const locale: localeCode = 'en'
				const newDescription: string = 'This product is amazing'
				await createProduct(catalogData.id, productData.id)

				ret = await updateProduct(productData.id, {
					description: { op: '$set', value: newDescription, locale },
				})
				ret.status.should.eq(OK)

				// Product description should be updated
				const product: IProduct = await Product.findOne({id: productData.id})
				product.description.value.get(locale).should.eq(newDescription)
			})

			it('Should $set description on default when you pass no locale', async() => {
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
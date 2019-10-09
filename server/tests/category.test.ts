import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, createCategory, categoryData, catalogData, logout, login, getCategory, getAllCategories, deleteCategory, updateCategory, createProduct, productData, updateProduct } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, UNAUTHORIZED, NOT_FOUND } = ResponseStatusTypes

import { Catalog, Category, Product, User } from '../src/models'
import { ICatalog, ICategory, IProduct } from '../src/interfaces'
import app from '../src/app'

let ret: any

describe('Category', () => {
	before(async () => {
		await app.ready
	})

	let catalog: any = {}

	before(async() => {
		await clearDataBase()
		await createUser(userData)
		await app.ready
	})
	
	beforeEach(async() => {
		await clearDataBase(Category, Catalog, User)
		await app.ready
		await createUser(userData)
		// Recreate a new catalog for each test
		catalog = (await createCatalog(catalogData.id, { master: true })).body
	})

	describe('Create category', () => {
		it('Should create category', async() => {
			// Create Category
			ret = await createCategory(catalog.id, categoryData.id)
			printret(ret)
			ret.should.have.status(OK)
			// Should return category
			ret.body.id.should.equal(categoryData.id)
			ret.body.catalog.should.exist

			// Catalog should have category
			await new Promise(resolve => Catalog.findOne({id: catalog.id}).populate('categories').exec((err, catalog: ICatalog) => {
				catalog.categories.find((c: ICategory) => c.id == categoryData.id).should.exist
				resolve()
			}))
			// Root Category should have category
			await new Promise(resolve => Category.findOne({id: 'root'}).populate({path: 'subcategories'}).exec((err, category: ICategory) => {
				category.subCategories.length.should.be.eq(1)
				resolve(0)
			}))
		})
		it('Should create two categories', async() => {
			// Create Category
			ret = await createCategory(catalog.id, categoryData.id)
			ret.should.have.status(OK)
			ret = await createCategory(catalog.id, categoryData.id + '2')
			ret.should.have.status(OK)
		})
		it('Should create a subcategory', async() => {
			const subCatId = 'subcat'

			ret = await createCategory(catalog.id, categoryData.id)
			ret.should.have.status(OK)

			ret = await createCategory(catalog.id, subCatId, { parent: categoryData.id })
			ret.should.have.status(OK)

			ret.body.id.should.equal(subCatId)
			catalog = await Catalog.findOne({id: catalog.id}).exec()
			const parentCategory: ICategory = await catalog.getCategory({id: categoryData.id})
			const childCategory: ICategory = await catalog.getCategory({id: subCatId})
			parentCategory.subCategories.find(id => id.toString() == childCategory._id.toString()).should.exist
			childCategory.parent.toString().should.equal(parentCategory._id.toString())
		})
		it('Should create a category of the same id in a different catalog', async() => {
			const cat2id = 'cat2'
			await createCatalog(cat2id)
			ret = await createCategory(catalog.id, categoryData.id)
			ret = await createCategory(cat2id, categoryData.id)
			ret.should.have.status(OK)
		})

		describe('Should fail to create if ...', () => {
			it('User is not authorized', async() => {
				await logout()
				ret = await createCategory(catalog.id, categoryData.id)
				ret.should.have.status(UNAUTHORIZED)
				await login(userData)
			})
			it('Catalog does not exist', async() => {
				ret = await createCategory('notarealcatalogid', categoryData.id)
				ret.status.should.eq(NOT_FOUND)
			})
			it('Category already exists in Catalog', async() => {
				ret = await createCategory(catalog.id, categoryData.id)
				ret = await createCategory(catalog.id, categoryData.id)
				ret.status.should.eq(BAD_REQUEST)
			})
			it('Parent category does not exist', async() => {
				ret = await createCategory(catalog.id, categoryData.id, { parent: 'doesntexist' })
				printret(ret)
				ret.status.should.eq(NOT_FOUND)
			})
			it('Parent is self', async() => {
				ret = await createCategory(catalog.id, categoryData.id, { parent: categoryData.id })
				ret.status.should.eq(BAD_REQUEST)

				// Category should not exist
				const category: ICategory = await Category.findOne({id: categoryData.id})
				expect(category).to.not.exist
			})
		})
	})

	describe('Get Category', () => {
		it('Should get category', async() => {
			ret = await createCategory(catalog.id, categoryData.id)
			ret = await getCategory(catalog.id, categoryData.id)
			ret.status.should.eq(OK)
			ret.body.id.should.eq(categoryData.id)
		})
		describe('Should fail to get category if ...', () => {
			it('user is not authorized', async() => {
				await logout()
				ret = await createCategory(catalog.id, categoryData.id)
				ret = await getCategory(catalog.id, categoryData.id)
				ret.status.should.eq(UNAUTHORIZED)
				await login(userData)
			})
			it('Category does not exist', async() => {
				ret = await getCategory(catalog.id, categoryData.id)
				ret.status.should.eq(NOT_FOUND)
			})
			it('Catalog does not exist', async() => {
				ret = await createCategory(catalog.id, categoryData.id)
				ret = await getCategory(catalog.id + '2', categoryData.id)
				ret.status.should.eq(NOT_FOUND)
			})
		})
	})

	describe('Get All Cateogries', () => {
		it('Should get all categories', async() => {
			ret = await createCategory(catalog.id, categoryData.id)
			ret = await createCategory(catalog.id, 'secondcat')
			ret = await getAllCategories(catalog.id)
			ret.status.should.eq(OK)
			ret.body.length.should.equal(3)
		})
		describe('Should fail if ...', () => {
			it('User is not authorized', async() => {
				await logout()
				ret = await createCategory(catalog.id, categoryData.id)
				ret = await createCategory(catalog.id, 'secondcat')
				ret = await getAllCategories(catalog.id)
				ret.status.should.eq(UNAUTHORIZED)
				await login(userData)
			})
			it('Catalog does not exist', async() => {
				ret = await createCategory(catalog.id, categoryData.id)
				ret = await createCategory(catalog.id, 'secondcat')
				ret = await getAllCategories(catalog.id + '2')
				ret.status.should.eq(NOT_FOUND)
			})
		})
	})

	const catid1 = 'category1'
	const catid2 = 'category2'
	const catid3 = 'category3'

	describe('Delete Category', () => {
		it('Should delete the category', async() => {
			
			await createCategory(catalogData.id, catid1)
			// Add two categories as subcats to cat1
			await createCategory(catalogData.id, catid2, {parent: catid1})
			await createCategory(catalogData.id, catid3, {parent: catid1})
			// Add product to category
			await createProduct(catalogData.id, productData.id)
			await updateProduct(productData.id, {
				assignedCategoriesByCatalog: {
					op: '$add',
					value: categoryData.id,
					catalog: catalogData.id,
				}
			})

			ret = await deleteCategory(catalogData.id, catid1)
			ret.status.should.eq(OK)

			// Cat1 should not exist
			let cat1: ICategory = await Category.findOne({id: catid1}).exec()
			expect(cat1).to.not.exist

			// Subcats should not have their parent set to Cat1
			await Promise.all([catid2, catid3].map(async catid => {
				let cat = await Category.findOne({id: catid}).exec()
				expect(cat.parent).to.not.exist
			}))
	
			const catalog: ICatalog = await Catalog.findOne({id: catalogData.id}).populate('categories').exec()
			// Cat1 should not be in Catalog.categories
			catalog.categories.should.not.include(cat => cat.id == catid1)
			
			// Products from that category should not longer be assigned to that category
			const product: IProduct = await Product.findOne({id: productData.id}).populate([
				{ path: 'assignedCategoriesByCatalog.catalog'},
				{ path: 'assignedCategoriesByCatalog.categories'},
			])
			let x = product.assignedCategoriesByCatalog.find(x => x.catalog.id == catalog.id)
			expect(x.categories.find(x => x.id == categoryData.id)).to.not.exist
		})
		describe('Should fail if ...', () => {
			it('Category does not exist', async() => {
				ret = await deleteCategory(catalogData.id, catid1)
				ret.should.have.status(NOT_FOUND)
			})
			it('User is not authenticated', async() => {
				await createCategory(catalogData.id, catid1)
				await logout()
				ret = await deleteCategory(catalogData.id, catid1)
				ret.should.have.status(UNAUTHORIZED)
			})
		})
	})

	describe('Update Category', () => {
		const newName: string = 'newName'
		const newId: string = 'newID'
		const parentId: string = 'parentId'
		const newParentId: string = 'newParentId'

		it('Should update name', async() => {
			await createCategory(catalogData.id, categoryData.id)

			ret = await updateCategory(catalogData.id, categoryData.id, {
				name: { op: '$set', value: newName }
			})
			ret.status.should.eq(OK)
			// Category's name should be updated
			const category: ICategory = await Category.findOne({id: categoryData.id})
			category.name.should.eq(newName)
		})
		it('Should update name and id', async() => {
			await createCategory(catalogData.id, categoryData.id)

			ret = await updateCategory(catalogData.id, categoryData.id, {
				name: { op: '$set', value: newName },
				id: { op: '$set', value: newId },
			})
			ret.status.should.eq(OK)
	
			// Category's name and id should be updated
			const cateogry: ICategory = await Category.findOne({id: newId})
			cateogry.name.should.eq(newName)
			cateogry.id.should.eq(newId)
		})
		it('Should link Catalog and parent if no parent was set', async() => {
			await createCategory(catalogData.id, categoryData.id)
			await createCategory(catalogData.id, parentId)

			ret = await updateCategory(catalogData.id, categoryData.id, {
				parent: { op: '$set', value: parentId }
			})
			ret.status.should.eq(OK)

			// Category.parent should be set
			const category: ICategory = await Category.findOne({id: categoryData.id}).populate('parent')
			category.parent.id.should.eq(parentId)
			// Parent.subcategories should be updated
			const parentCategory: ICategory = await Category.findOne({id: parentId}).populate('subCategories')
			parentCategory.subCategories.find((x: ICategory) => x.id == categoryData.id).should.exist
		})
		it('Should unlink Catalog with previous parentm and link Catalog with parent', async() => {
			await createCategory(catalogData.id, categoryData.id)
			await createCategory(catalogData.id, parentId)
			await createCategory(catalogData.id, newParentId)

			ret = await updateCategory(catalogData.id, categoryData.id, {
				parent: { op: '$set', value: parentId }
			})
			ret = await updateCategory(catalogData.id, categoryData.id, {
				parent: { op: '$set', value: newParentId }
			})
			ret.status.should.eq(OK)

			// Category.parent should be set
			const category: ICategory = await Category.findOne({id: categoryData.id}).populate('parent')
			category.parent.id.should.eq(newParentId)
			// Parent.subcategories should be updated
			const parentCategory: ICategory = await Category.findOne({id: newParentId}).populate('subCategories')
			parentCategory.subCategories.find((x: ICategory) => x.id == categoryData.id).should.exist
			// Old parent.subCategories should be updated
			const oldParentCategory: ICategory = await Category.findOne({id: parentId}).populate('subCategories')
			expect(oldParentCategory.subCategories.find((x: ICategory) => x.id == categoryData.id)).to.not.exist
		})

		describe('Should fail if ...', () => {
			it('User is not authorized', async() => {
				await createCategory(catalogData.id, categoryData.id)
				await logout()
				ret = await updateCategory(catalogData.id, categoryData.id, {
					name: { op: '$set', value: newName },
					id: { op: '$set', value: newId },
				})
				ret.status.should.eq(UNAUTHORIZED)
			})
			it('Name is invalid', async() => {
				await createCategory(catalogData.id, categoryData.id)
				ret = await updateCategory(catalogData.id, categoryData.id, {
					name: { op: '$set', value: [newName] },
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('Id is not unique in category', async() => {
				await createCategory(catalogData.id, categoryData.id)
				await createCategory(catalogData.id, newId)

				ret = await updateCategory(catalogData.id, categoryData.id, {
					id: { op: '$set', value: newId }
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('Parent does not exist', async() => {
				await createCategory(catalogData.id, categoryData.id)
				ret = await updateCategory(catalogData.id, categoryData.id, {
					parent: { op: '$set', value: 'invalidParentId' },
				})
				ret.status.should.eq(NOT_FOUND)
			})
			it('Parent is self', async() => {
				await createCategory(catalogData.id, catid1)
				await createCategory(catalogData.id, catid2)
				ret = await updateCategory(catalogData.id, catid1, {
					parent: { op: '$set', value: catid2 },
				})
				ret.status.should.eq(OK)
				ret = await updateCategory(catalogData.id, catid2, {
					parent: { op: '$set', value: catid1 },
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('Parent\`s parent is self', async() => {
				await createCategory(catalogData.id, catid1)
				await createCategory(catalogData.id, catid2)
				await createCategory(catalogData.id, catid3)
				ret = await updateCategory(catalogData.id, catid1, {
					parent: { op: '$set', value: catid2 },
				})
				ret.status.should.eq(OK)
				ret = await updateCategory(catalogData.id, catid2, {
					parent: { op: '$set', value: catid3 },
				})
				ret.status.should.eq(OK)
				ret = await updateCategory(catalogData.id, catid3, {
					parent: { op: '$set', value: catid1 },
				})
				ret.status.should.eq(BAD_REQUEST)
			})
		})
	})
})
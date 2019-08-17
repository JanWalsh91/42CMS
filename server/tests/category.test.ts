import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, createCategory, categoryData, catalogData, logout, login, getCategory, getAllCategories, deleteCategory } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, UNAUTHORIZED, NOT_FOUND } = ResponseStatusTypes

import { ICategory, Category } from '../src/models/categoryModel';
import { Catalog, ICatalog } from '../src/models/catalogModel';

let ret: any

describe('Category', () => {
	let catalog: any = {}

	before(async() => {
		await clearDataBase()
		await createUser(userData)
	})
	
	beforeEach(async() => {
		await clearDataBase(Category, Catalog)
		catalog = (await createCatalog(catalogData.id)).body
	})

	describe('Create category', () => {
		it('Should create category', async() => {
			console.log(chalk.blue('Should create category'))
			// Create Category
			ret = await createCategory(catalog.id, categoryData.id)
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
			console.log(chalk.blue('Should create two categories'))
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
		it('Should create a categeory of the same id in a different catalog', async() => {
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
				ret.status.should.eq(NOT_FOUND)
			})
			// Prevent circular linking of category hierachies: not possible in Create!
			it('Parent is self')
			it('Parent\`s parent is self')
			it('Parent\`s parent\'s parnetis self')
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
		})
	})

	describe('Delete Category', () => {
		it('Should delete the category', async() => {
			const catid1 = 'category1'
			const catid2 = 'category2'
			const catid3 = 'category3'
			await createCategory(catalogData.id, catid1)
			// Add two categories as subcats to cat1
			await createCategory(catalogData.id, catid2, {parent: catid1})
			await createCategory(catalogData.id, catid3, {parent: catid1})
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
			
			// TODO: products from that category should not longer be assigned to that category
		})
	})
})
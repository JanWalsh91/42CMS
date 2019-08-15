import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, createCategory, categoryData, catalogData } from '../server/tests/common';
import ResponseStatusTypes from '../server/src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST } = ResponseStatusTypes

import { ICategory, Category } from '../server/src/models/categoryModel';
import { Catalog, ICatalog } from '../server/src/models/catalogModel';

let ret: any

describe('Category', () => {
	let catalog: any = {}

	before(async() => {
		console.log(chalk.blue('[Category] before'))
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
		console.log(chalk.blue('[Category] before END'))
	})
	
	beforeEach(async() => {
		console.log(chalk.blue('[Category] beforeEach'))
		await clearDataBase(Category, Catalog)
		
		ret = await createCatalog(catalogData.id)
		catalog = ret.body
		console.log(chalk.blue('[Category] beforeEach END'))
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
			let subCatId = 'subcat'
			console.log(chalk.blue('Should create a subcategory'))
			console.log(chalk.blue('Creating parent category START'))
			// Create category
			ret = await createCategory(catalog.id, categoryData.id)
			ret.should.have.status(OK)
			console.log(chalk.blue('Creating parent category END'))

			// Create subcategory
			console.log(chalk.blue('Creating child category START'))

			ret = await createCategory(catalog.id, subCatId, { parentCategoryId: categoryData.id })
			ret.should.have.status(OK)
			console.log(chalk.blue('Creating child category END'))

			ret.body.id.should.equal(subCatId)
			catalog = await Catalog.findOne({id: catalog.id}).exec()
			let parentCategory: ICategory = await catalog.getCategory({id: categoryData.id})
			let childCategory: ICategory = await catalog.getCategory({id: subCatId})
			// Parent Category should have ChildCategory as subCategory
			console.log({parentCategory, childCategory})
			parentCategory.subCategories.find(id => id.toString() == childCategory._id.toString()).should.exist
			childCategory.parent.toString().should.equal(parentCategory._id.toString())
			// parentCategory.getSubcategory({id: subCatId}).should.exist
			// ChildCategory should have ParentCategory as parentCategory
			// childCategory.parentCategory
		})
	})
})
import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, createProject, projectData, createCategory, categoryData, catalogData } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST } = ResponseStatusTypes

import { Project } from '../src/models/projectModel';
import { ICategory } from '../src/models/categoryModel';

let ret: any

describe.only('Category', () => {
	let project: any = {}
	let catalog: any = {}

	before(async() => {
		console.log('[Category] beforeEach')
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
	})
	
	beforeEach(async() => {
		console.log('[Category] beforeEach')
		await clearDataBase(Project)
		// Create project
		ret = await createProject(projectData)
		project = ret.body
		// Create catalog
		ret = await createCatalog(project.id, catalogData.id)
		catalog = ret.body
	})

	describe.only('Create category', () => {
		it('Should create category', async() => {
			console.log(chalk.blue('Should create category'))
			// Create Category
			ret = await createCategory(project.id, catalog.id, categoryData.id)
			printret(ret)
			ret.should.have.status(OK)
			// Should return category
			ret.body.id.should.equal(categoryData.id)
		})
		it.only('Should create a subcategory', async() => {
			let subCatId = 'subcat'
			console.log(chalk.blue('Should create a subcategory'))
			// Create category
			ret = await createCategory(project.id, catalog.id, categoryData.id)
			ret.should.have.status(OK)
			// Create subcategory
			ret = await createCategory(project.id, catalog.id, subCatId, categoryData.id)
			ret.should.have.status(OK)
			ret.body.id.should.equal(subCatId)
			project = await Project.findOne({id: project.id})
			catalog = project.getCatalog({id: catalog.id})
			let parentCategory: ICategory = catalog.getCategory({id: categoryData.id})
			let childCategory: ICategory = catalog.getCategory({id: subCatId})
			// Parent Category should have ChildCategory as subCategory
			console.log({parentCategory, childCategory})
			// parentCategory.getSubcategory({id: subCatId}).should.exist
			// ChildCategory should have ParentCategory as parentCategory
			// childCategory.parentCategory
		})
	})
})
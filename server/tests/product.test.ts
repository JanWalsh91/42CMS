import * as chai from 'chai'
chai.should()
import chalk from 'chalk';

import { clearDataBase, createUser, printret, userData, createProject, projectData, createCatalog, catalogData, createCategory, categoryData, createProduct, productData  } from './common';

import { User } from '../src/models/userModel'
import { Project, IProject } from '../src/models/projectModel'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { Category } from '../src/models/categoryModel';
import { Catalog } from '../src/models/catalogModel';
import { Product, IProduct } from '../src/models/productModel';
import { Schema } from 'mongoose';
const { OK, BAD_REQUEST } = ResponseStatusTypes 

let ret: any;
let project: any = {}
let catalog: any = {}

describe('Product', () => {

	before(async() => {
		console.log(chalk.blue('[Product] before'))
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
		console.log(chalk.blue('[Product] before END'))
	})

	beforeEach(async() => {
		console.log(chalk.blue('[Product] beforeEach'))
		await clearDataBase(Project, Category, Catalog)
		// Create project
		ret = await createProject(projectData)
		project = ret.body
		// Create catalog
		ret = await createCatalog(project.id, catalogData.id, {isMaster: true})
		catalog = ret.body
		// Create catalog
		ret = await createCategory(project.id, catalogData.id, categoryData.id)
		catalog = ret.body
		console.log(chalk.blue('[Product] beforeEach END'))
	})

	describe('Create', () => {
		it.only('Should create a product', async() => {
			console.log(chalk.blue('Should create a product'));
			ret = await createProduct(project.id, catalogData.id, productData.id, {name: productData.name})
			// Should return a product
			ret.status.should.equal(OK)
			// Product should exist
			let product: IProduct = await Product.findOne({id: productData.id}).populate([
				{ path: 'project', populate: { path: 'products' } },
				{ path: 'masterCatalog', populate: { path: 'products' } }
			]).exec()
			product.masterCatalog.should.exist
			product.masterCatalog.products.find((_product: IProduct) => _product.id == productData.id).should.exist
			product.project.should.exist
			product.project.products.find((_product: IProduct) => _product.id == productData.id).should.exist
		})
		describe('Should fail if ...', () => {
			it('Product of that id already exists in project', async() => {
				console.log(chalk.blue('Should fail if ... Product of that id already exists in project'));
				return 
			})
		})
	})
})
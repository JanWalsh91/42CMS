import app from '../src/app'
import * as chai from 'chai'
import chaiHttp = require('chai-http')
chai.use(chaiHttp)
const agent = chai.request.agent(app)

import { User } from '../src/models/userModel'
import { Catalog } from '../src/models/catalogModel'
// import { Site } from '../src/models/siteModel'
import { Category } from '../src/models/categoryModel'
// import { Product } from '../src/models/productModel'

export const userData = {
	name: 'John Smith',
	username: 'jsmith',
	password: 'password'
}

export const catalogData = {
	name: 'International',
	id: 'international'
}

export const categoryData = {
	name: 'Fragrance',
	id: 'fragrance'
}

export const productData = {
	name: 'Miss Dior',
	id: 'missdior'
}

export const clearDataBase = async (...models: any) => {
	if (!models.length) {
		models = [
			User,
			Catalog,
			// Site,
			Category,
			// Product
		]
	}
	await Promise.all(models.map(model => model.deleteMany({})))
}

// ===== USERS ===== //

	export const getUser = (username: string) => 
		agent.get(`/users/${username}`)

	export const getAllUsers = () =>
		agent.get('/users')

	// Creates and logs in user (Sets sessionID)
	export const createUser = (params: {username: string, password: string, name?: string}) => 
		agent.post('/users').send(params)

	// Authorize user (with sessionID)
	export const authUser = () => 
		agent.get('/auth')

	// Login user
	export const login = (params: {username: string, password: string}) => 
		agent.post('/login').send(params)

	// Logout user
	export const logout = () => 
		agent.post('/logout')

	// Delete user
	export const deleteUser = (userid?: string) =>
		agent.delete(`/users${userid ? `/${userid}` : ''}`)

// ===== CATALOGS ====== //

	export const createCatalog = (catalogid: string, params?: object) =>
		agent.post(`/catalogs/`).send({id: catalogid, ...params})

	export const getCatalog = (catalogid: string) =>
		agent.get(`/catalogs/${catalogid}`)
	
	export const getAllCatalogs = () =>
		agent.get(`/catalogs`)

	export const deleteCatalog = (catalogid: string) =>
		agent.delete(`/catalogs/${catalogid}`)

// ===== CATEGORIES ====== //

	export const createCategory = (catalogid: string, categoryid: string, params?: object) =>
		agent.post(`/catalogs/${catalogid}/categories`).send({id: categoryid, ...params})

	export const getCategory = (catalogid: string, categoryid: string) =>
		agent.get(`/catalogs/${catalogid}/categories/${categoryid}`)

	export const getAllCategories = (catalogid: string) =>
		agent.get(`/catalogs/${catalogid}/categories`)

	export const deleteCategory = (catalogid: string, categoryid: string) =>
		agent.delete(`/categories/${catalogid}/categories/${categoryid}`)

// ===== PRODUCTS ====== //

	export const createProduct = (masterCatalogId: string, productid: string, params?: object) => 
		agent.post(`/products`).send({id: productid, masterCatalogId, ...params})

	export const updateProduct = (productid: string, params?: object) => 
		agent.put(`/products/${productid}`).send(params)

	export const deleteProduct = (productid: string) =>
		agent.delete(`/products/${productid}`)

// ===== UTILITY ===== //

export const printret = ret => {
	console.log({status: ret.status, body: ret.body})
}




















// old project

// // ===== PROJECTS ===== //

// 	export const createProject = (params: {name: string, id: string}) =>
// 		agent.post('/projects').send(params)

// 	// Gets all projects of user (set by session)
// 	export const getProjects = () => 
// 		agent.get('/projects')

// 	// Gets project id of user (set by session)
// 	export const getProject = (projectid: string) =>
// 		agent.get(`/projects/${projectid}`)
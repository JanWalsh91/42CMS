import app from '../src/app'
import * as chai from 'chai'
import chaiHttp = require('chai-http')
chai.use(chaiHttp)
const agent = chai.request.agent(app)

import { User } from '../src/models/userModel'
import { Project } from '../src/models/projectModel'
// import { Product } from '../src/models/productModel'

export const userData = {
	name: 'John Smith',
	username: 'jsmith',
	password: 'password',
	projectName: 'Default project',
	projectId: 'defaultProject'
}

export const projectData = {
	name: 'Dior',
	id: 'dior'
}

export const catalogData = {
	name: 'International',
	id: 'int'
}

export const categoryData = {
	name: 'Fragrance',
	id: 'fragrance'
}

export const clearDataBase = async (...models: any) => {
	if (!models.length) {
		models = [
			User,
			Project
		]
	}
	await Promise.all(models.map(model => model.deleteMany({})))
}

// ===== USERS ===== //

	export const getAllUsers = () =>
		agent.get('/users')

	// Creates and logs in user (Sets sessionID)
	export const createUser = (params: {username: string, password: string, projectName: string, projectId: string, name?: string}) => 
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

// ===== PROJECTS ===== //

	export const createProject = (params: {name: string, id: string}) =>
		agent.post('/projects').send(params)

	// Gets all projects of user (set by session)
	export const getProjects = () => 
		agent.get('/projects')

	// Gets project id of user (set by session)
	export const getProject = (projectid: string) =>
		agent.get(`/projects/${projectid}`)

// ===== CATALOGS ====== //

	export const createCatalog = (projectid: string, catalogid: string) =>
		agent.post(`/projects/${projectid}/catalogs/`).send({id: catalogid})

	export const getCatalog = (projectid: string, catalogid: string) =>
		agent.get(`/projects/${projectid}/catalogs/${catalogid}`)
	
	export const getAllCatalogs = (projectid: string) =>
		agent.get(`/projects/${projectid}/catalogs`)

// ===== CATEGORIES ====== //

	export const createCategory = (projectid: string, catalogid: string, categoryid: string, parentCategoryId?: string) =>
		agent.post(`/projects/${projectid}/catalogs/${catalogid}/categories`).send({id: categoryid, parentCategoryId})

	export const getCategory = (projectid: string, catalogid: string, categoryid: string) =>
		agent.get(`/projects/${projectid}/catalogs/${catalogid}/categories/${categoryid}`)

	export const getAllCategories = (projectid: string, catalogid: string) =>
		agent.get(`/projects/${projectid}/catalogs/${catalogid}/categories`)

// ===== UTILITY ===== //

export const printret = ret => {
	console.log({status: ret.status, body: ret.body})
}


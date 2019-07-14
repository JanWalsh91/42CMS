import chalk from 'chalk'
import * as chai from 'chai'
chai.should()

import { login, logout, clearDataBase, userData, createUser, printret, createProject, getProjects } from './common'

import { User } from '../src/models/userModel'
import { Project } from '../src/models/projectModel'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST } = ResponseStatusTypes 

let ret: any

describe('Project', () => {

	beforeEach(async () => {
		console.log('[Project] beforeEach')
		await clearDataBase()
		ret = await createUser(userData)
	})

	describe('Create', () => {
		it('Should create a project', async() => {
			console.log(chalk.blue('Should create a project'))
			const [name, id] = ['Dior', 'dior']
			ret = await createProject({name, id})
			ret.should.have.status(OK)
			let project = await Project.find({name})
			project.should.exist
		})
		it('Should create two projects of same name by different users', async() => {
			const [name, id] = ['Dior', 'dior']
			// Create project with first user
			ret = await createProject({name, id})
			ret.should.have.status(OK)
			let project = await Project.find({name})
			project.should.exist

			// Create second user
			const otherUserData = {
				name: 'Dick Smith',
				username: 'dsmith',
				password: 'password',
				projectName: 'Default project 2',
				projectId: 'defaultProject2'
			}
			ret = await createUser(otherUserData)
			// Create project with first user
			ret = await createProject({name, id: 'dior2'})
			ret.should.have.status(OK)
			project = await Project.find({id: 'dior2'})
			project.should.exist

		})
		describe('Should fail if ...', () => {
			it('Project of that name by a user already exists', async () => {
				console.log(chalk.blue('Project of that name by a user already exists'))
				const [name, id] = ['Dior', 'dior']
				ret = await createProject({name, id})
				ret.should.have.status(OK)
				ret = await createProject({name, id})
				ret.should.have.status(BAD_REQUEST)
			})
			it('Project with same id already exists', async() => {
				console.log(chalk.blue('Project with same id already exists'))
				const [name1, name2, id] = ['Dior', 'Dior2', 'dior'] 
				ret = await createProject({name: name1, id})
				ret.should.have.status(OK)
				ret = await createProject({name: name2, id})
				ret.should.have.status(BAD_REQUEST)
			})
		})
	})

	describe('Get all', () => {
		it('Should get all projects by a user', async() => {
			console.log(chalk.blue('Should get all projects by a user'))
			await createProject({name: 'Dior', id: 'dior'})
			await createProject({name: 'Guerlain', id: 'guerlain'})
			ret = await getProjects()
			printret(ret)
			ret.should.have.status(OK)
			ret.body.projects.should.exist
			ret.body.projects.forEach(project => console.log(`name: ${project.name}`))
		})
	})
})
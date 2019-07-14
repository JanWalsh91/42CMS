import chalk from 'chalk'
import * as chai from 'chai'
chai.should()

import { login, logout, clearDataBase, userData, createUser, printret, createProject, getProjects } from './common'

import { User } from '../src/models/user'
import { Project } from '../src/models/project'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST } = ResponseStatusTypes 

let ret: any

describe('Project', () => {
	let userid: string

	beforeEach(async () => {
		console.log('[Project] beforeEach')
		await clearDataBase()
		ret = await createUser(userData)
		printret(ret)
		userid = ret.body._id
	})

	describe('Create', () => {
		it('Should create a project', async() => {
			console.log(chalk.blue('Should create a project'))
			const name = 'Dior'
			ret = await createProject({name})
			ret.should.have.status(OK)
			let project = await Project.find({name})
			project.should.exist
		})
		it('Should create two projects of same name by different users', async() => {
			const name = 'Dior'
			// Create project with first user
			ret = await createProject({name})
			ret.should.have.status(OK)
			let project = await Project.find({name})
			project.should.exist

			// Create second user
			const otherUserData = {
				name: 'Dick Smith',
				username: 'dsmith',
				password: 'password',
				projectName: 'Default project 2'
			}
			ret = await createUser(otherUserData)
			// Create project with first user
			ret = await createProject({name})
			ret.should.have.status(OK)
			project = await Project.find({name})
			project.should.exist

		})
		describe('Should fail if ...', () => {
			it('Project of that name by a user already exists', async () => {
				console.log(chalk.blue('Project of that name by a user already exists'))
				const name = 'Dior'
				ret = await createProject({name})
				ret.should.have.status(OK)
				ret = await createProject({name})
				printret(ret)
				ret.should.have.status(BAD_REQUEST)
			})
		})
	})

	describe('Get all', () => {
		it('Should get all projects by a user', async() => {
			console.log(chalk.blue('Should get all projects by a user'))
			await createProject({name: 'Dior'})
			await createProject({name: 'Guerlain'})
			ret = await getProjects()
			printret(ret)
			ret.should.have.status(OK)
			ret.body.projects.should.exist
			ret.body.projects.forEach(project => console.log(`name: ${project.name}`))
		})
	})
})
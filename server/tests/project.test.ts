import * as chai from 'chai'
chai.should()

import { clearDataBase, userData, createUser, printret, createProject, getProjects } from './common'

import { User } from '../src/models/user'
import { Project } from '../src/models/project'
import chalk from 'chalk'

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
			ret.should.have.status(200)
			let project = await Project.find({name})
			project.should.exist			
		})
		describe('Should fail if ...', () => {
			it('Project of that name already exists', async () => {
				console.log(chalk.blue('Project of that name already exists'))
				const name = 'Dior'
				ret = await createProject({name})
				ret.should.have.status(200)
				ret = await createProject({name})
				printret(ret)
				ret.should.have.status(400)
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
			ret.should.have.status(200)
			ret.body.projects.should.exist
			ret.body.projects.forEach(project => console.log(`name: ${project.name}`))
		})
	})
})
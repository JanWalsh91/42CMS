import * as chai from 'chai'
chai.should()

import { authUser, login, logout, clearDataBase, userData, getAllUsers, createUser, printret } from './common'

import { User } from '../src/models/userModel'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import chalk from 'chalk';
const { OK, BAD_REQUEST, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any

describe.only('User', () => {
	beforeEach(async () => {
		console.log(chalk.keyword('goldenrod')('====== [User] beforeEach START ======'))
		await clearDataBase()
		console.log(chalk.keyword('goldenrod')('====== [User] beforeEach END   ======'))
	})

	describe('Create', () => {
		it('Should create a user and a project', async () => {
			// Create user
			ret = await createUser(userData)
			ret.should.have.status(OK)
			// User should exist
			const user = await User.find({apiKey: ret.body.user.apiKey})
			user.should.exist
		})
	})

	describe('Auth', () => {
		it('Should return 200', async () => {
			// Create user
			ret = await createUser(userData)
			ret.should.have.status(OK)
			// Auth
			ret = await authUser()
			printret(ret);
			ret.should.have.status(OK)
		})
		describe('Should fail if', () => {
			it('There is no session ID', async() => {
				// Auth
				ret = await authUser()
				ret.should.have.status(UNAUTHORIZED)
			})
		})
	})
	
	describe('Logout', () => {
		it('Should logout', async() => {
			// Create user
			ret = await createUser(userData)
			ret.should.have.status(OK)
			// Logout should return OK
			ret = await logout()
			ret.should.have.status(OK)
			// Auth should fail
			ret = await authUser()
			ret.should.have.status(UNAUTHORIZED)
		})
	})

	describe('Login', () => {
		it('Should login', async () => {
			// Create user
			ret = await createUser(userData)
			ret.should.have.status(OK)
			// Logout
			ret = await logout()
			ret.should.have.status(OK)
			// Login
			// Should get user info
			ret = await login({...userData})
			ret.should.have.status(OK)
		})
	})

	describe('getAll', () => {
		it('Should get all users', async () => {
			ret = await getAllUsers()
			ret.should.have.status(200)
			ret.body.should.be.a('array')
			ret.body.length.should.be.eql(0)
		})
	})
})
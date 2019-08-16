import * as chai from 'chai'
chai.should()

import { authUser, login, logout, clearDataBase, userData, getAllUsers, createUser, printret } from './common'

import { User } from '../src/models/userModel'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import chalk from 'chalk';
const { OK, BAD_REQUEST, UNAUTHORIZED, NOT_FOUND } = ResponseStatusTypes 

let ret: any

describe('User', () => {
	beforeEach(async () => await clearDataBase())

	describe('Create', () => {
		it('Should create a user', async () => {
			// Create user
			ret = await createUser(userData)
			ret.should.have.status(OK)
			// User should exist
			const user = await User.find({apiKey: ret.body.user.apiKey})
			user.should.exist
		})
		describe('Should fail if ...', () => {
			it('User already exists', async () => {
				ret = await createUser(userData)
				ret = await createUser(userData)
				ret.status.should.eq(BAD_REQUEST)
			})
			it('Password is invalid', async () => {
				ret = await createUser({username: 'test', password: '1'})
				ret.status.should.eq(BAD_REQUEST)
			})
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
		describe('Should fail if ...', () => {
			it('User does not exist', async() => {
				ret = await login({...userData})
				ret.should.have.status(UNAUTHORIZED)
			})
			it('Password is invalid', async() => {
				// Create user
				ret = await createUser(userData)
				ret.should.have.status(OK)
				// Logout
				ret = await logout()
				ret.should.have.status(OK)
				// Login with wrong password
				ret = await login({...userData, password: 'notmypassword'})
				ret.should.have.status(UNAUTHORIZED)
			})
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
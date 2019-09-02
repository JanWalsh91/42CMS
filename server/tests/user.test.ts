import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk';

import { authUser, login, logout, clearDataBase, userData, getUser, getAllUsers, createUser, printret, deleteUser } from './common'

import { User } from '../src/models'
import { IUser } from '../src/interfaces'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
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
			const user = await User.findOne({apiKey: ret.body.user.apiKey})
			user.should.exist
			// First user is admin
			user.admin.should.eq(true)
		})
		it('Should create a user with only a username and password', async() => {
			ret = await createUser({username: 'test', password: '32321321'})
			ret.should.have.status(OK)
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

	describe('get', () => {
		it('Should get a user', async () => {
			ret = await createUser(userData)
			ret = await getUser(userData.username)
			ret.should.have.status(OK)
			ret.body.username.should.eq(userData.username)
		})
		describe('Should fail if ...', () => {
			it('user is unauthorized', async() => {
				ret = await createUser(userData)
				await logout()
				ret = await getUser(userData.username)
				ret.status.should.eq(UNAUTHORIZED)
			})
			it('user does not exist', async() => {
				ret = await getUser(userData.username)
				ret.status.should.eq(UNAUTHORIZED)
			})
		})
	})

	describe('getAll', () => {
		it('Should get all users', async () => {
			ret = await createUser(userData)				
			ret = await getAllUsers()
			ret.should.have.status(OK)
			ret.body.should.be.a('array')
			ret.body.length.should.be.eql(1)
		})

		describe('Should fail if ...', () => {
			it('user is unauthorized', async () => {
				ret = await createUser(userData)				
				await logout()
				ret = await getAllUsers()
				ret.status.should.eq(UNAUTHORIZED)
			})
		})
	})
	describe('Delete User', () => {
		const secondUser = {
			username: 'second',
			password: 'lksjdflksj'
		}

		it('Should delete a non-admin user (self)', async() => {
			ret = await createUser(userData)				
			await logout()
			console.log('creating user with ', secondUser)
			ret = await createUser(secondUser)
			ret = await deleteUser()
			printret(ret)
			ret.status.should.eq(OK)

			const user: IUser = await User.findOne({username: secondUser.username}).exec()
			expect(user).to.not.exist
		})
		it('Should delete a non-admin user', async() => {
			ret = await createUser(userData)				
			await logout()
			ret = await createUser(secondUser)
			await login(userData)
			ret = await deleteUser(secondUser.username)
			ret.status.should.eq(OK)

			const user: IUser = await User.findOne({username: secondUser.username}).exec()
			expect(user).to.not.exist
		})
		describe('Should fail to delete user if ...', () => {
			it('user is admin (self)', async() => {
				ret = await createUser(userData)
				ret = await deleteUser()
				ret.status.should.eq(UNAUTHORIZED)
			})
			it('non admin user tries to delete other user', async() => {
				ret = await createUser(userData)			
				await logout()
				ret = await createUser(secondUser)				
				ret = await deleteUser(userData.username)
				ret.status.should.eq(UNAUTHORIZED)
			})
		})
	})
})
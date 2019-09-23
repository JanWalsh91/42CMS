import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'
import * as path from 'path'

import app from '../src/app'
import { Locale } from '../src/models'
import { jsonLocale } from '../src/types'
import { ILocale } from '../src/interfaces';
import { clearDataBase, uploadImage, printret, createUser, userData } from './common'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'

const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes

const folderPath: string = path.join(__dirname, './resources/')

const placeholderImages: string[] = [
	'150.png',
	'800x500.png',
].map(img => `${folderPath}/${img}`)

let ret: any;

describe('Image', () => {
	before(async () => {
		// wait for server to init async tasks
		await app.ready
		await clearDataBase()
		await app.ready
		// Create user
		await createUser(userData)		
	})
	describe('Create', () => {
		it.only('Should upload and create an image', async() => {
			ret = await uploadImage(placeholderImages[0], {})
			printret(ret)
			ret.status.should.eq(OK)
		})
	})
})
import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'
import * as path from 'path'

import app from '../src/app'
import { Locale, Image } from '../src/models'
import { jsonLocale } from '../src/types'
import { ILocale, IImage } from '../src/interfaces';
import { clearDataBase, uploadImage, printret, createUser, userData, removeImages, deleteImage, placeholderImages, exportToXLM, getAllImpexFiles, getImpexFile } from './common'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'

const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes

let ret: any;

describe('Export', () => {
	beforeEach(async () => {
		// wait for server to init async tasks
		await app.ready
		await clearDataBase()
		await app.ready
		// Create user
		await createUser(userData)
	})

	it('Should get all files in impex', async() => {
		ret = await getAllImpexFiles()
		printret(ret)
		ret.status.should.eq(OK)
	})

	it.only('Should download a file from impex', async() => {
		ret = await getImpexFile('test.txt')
		printret(ret)
		ret.status.should.eq(OK)
		console.log(ret)
	})

	it('Should export all catalogs', async() => {
		ret = await exportToXLM('myexport.xml', ['Catalog'])
		printret(ret)
		ret.status.should.eq(OK)
	})
})

// describe('Import', () => {

// })
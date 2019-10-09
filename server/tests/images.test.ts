import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'
import * as path from 'path'

import app from '../src/app'
import { Locale, Image } from '../src/models'
import { jsonLocale } from '../src/types'
import { ILocale, IImage } from '../src/interfaces';
import { clearDataBase, uploadImage, printret, createUser, userData, removeImages, deleteImage, placeholderImages, invalidImgs } from './common'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'

const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes

let ret: any;
let imageId = 'img1'

describe.only('Image', () => {
	before(async () => {
		// wait for server to init async tasks
		await app.ready
		await clearDataBase()
		await app.ready
		// Create user
		await createUser(userData)
	})
	beforeEach(async () => {
		await removeImages()
		await clearDataBase(Image)
		await app.ready
	})
	describe('Create', () => {
		it('Should upload and create an image', async() => {
			ret = await uploadImage(placeholderImages[0], imageId)
			ret.status.should.eq(OK)
			let image: IImage = await Image.findOne({id: imageId})
			expect(image.id).to.eq(imageId)
		})
		describe('Should fail if ...', () => {
			it('id is already in use', async() => {
				ret = await uploadImage(placeholderImages[0], imageId)
				ret = await uploadImage(placeholderImages[0], imageId)
				ret.status.should.eq(BAD_REQUEST)
			})
			it('Is not an image (bad png file)', async () => {
				ret = await uploadImage(invalidImgs[0], imageId)
				ret.status.should.eq(BAD_REQUEST)
			})
			it('Is not an image (txt file)', async () => {
				ret = await uploadImage(invalidImgs[1], imageId)
				ret.status.should.eq(BAD_REQUEST)
			})
		})
	})
	describe('Delete', () => {
		it('Should delete an image', async() => {
			ret = await uploadImage(placeholderImages[0], imageId)
			ret = await deleteImage(imageId)
			ret.status.should.eq(OK)
			let image: IImage = await Image.findOne({id: imageId})
			expect(image).to.not.exist			
		})
	})
})
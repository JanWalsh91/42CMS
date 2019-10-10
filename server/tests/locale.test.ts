import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, logout, createCategory, categoryData, deleteCatalog, updateCatalog, getAllLocales, updateLocale } from './common'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

import { Locale, GlobalSettings, User } from '../src/models'
import app from '../src/app'
import { ILocale } from '../src/interfaces'

let ret: any

describe('Locale', () => {
	beforeEach(async() => {
		await app.ready
		await clearDataBase(Locale, GlobalSettings, User)
		await app.ready
		await createUser(userData)
	})

	describe('Get All', () => {
		it('Should get all locales', async () => {
			ret = await getAllLocales()
			ret.status.should.equal(OK)
		})
		describe('Should fail if ...', () => {
			it('... user is not authenticated', async() => {
				await logout()
				ret = await getAllLocales()
				ret.status.should.equal(UNAUTHORIZED)
			})
		})
	})

	describe('Update', () => {
		const localeid: string = 'en_US'

		it('Should $set fallback', async() => {
			const newFallback: string = 'fr'

			ret = await updateLocale(localeid, {
				fallback: { op: '$set', value: newFallback }
			})
			ret.status.should.equal(OK)
			let locale: ILocale = await Locale.findOne({id: localeid}).populate('fallback')
			locale.fallback.id.should.equal(newFallback)
		})
		it('Should $unset fallback', async() => {
			ret = await updateLocale(localeid, {
				fallback: { op: '$unset' }
			})
			ret.status.should.equal(OK)
			let locale: ILocale = await Locale.findOne({id: localeid}).populate('fallback')
			locale.fallback.id.should.equal('default')
		})

		describe('Should fail if ... ', () => {
			it('... fallback locale id is invalid', async () => {
				ret = await updateLocale(localeid, {
					fallback: { op: '$set', value: 'invalidid' }
				})
				ret.status.should.eq(NOT_FOUND)
			})
			it('... locale id is invalid', async () => {
				ret = await updateLocale('invalidid', {
					fallback: { op: '$set', value: 'fr' }
				})
				ret.status.should.eq(NOT_FOUND)
			})
			it('... locale and fallback locale are the same', async () => {
				ret = await updateLocale(localeid, {
					fallback: { op: '$set', value: localeid }
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... fallback locale is invalid type', async () => {
				ret = await updateLocale(localeid, {
					fallback: { op: '$set', value: {localeid} }
				})
				ret.status.should.eq(BAD_REQUEST)
			})
			it('... user is not authenticated', async() => {
				await logout()
				ret = await updateLocale(localeid, {
					fallback: { op: '$set', value: 'fr' }
				})
				ret.status.should.equal(UNAUTHORIZED)
			})
		})
	})
})
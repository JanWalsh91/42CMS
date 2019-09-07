import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import { clearDataBase, createUser, printret, userData, createCatalog, getCatalog, getAllCatalogs, logout, createCategory, categoryData, deleteCatalog, updateCatalog, getAllLocales, updateLocale } from './common'
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

import { Locale, GlobalSettings } from '../src/models'
import app from '../src/app'
import { ILocale } from '../src/interfaces'

let ret: any

describe.only('Locale', () => {
	before(async () => {
		await app.ready
		await clearDataBase()
		await createUser(userData)
	})

	beforeEach(async() => {
		await clearDataBase(Locale, GlobalSettings)
	})

	describe('Get All', () => {
		it('Should get all locales', async () => {
			ret = await getAllLocales()
			ret.status.should.equal(OK)
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
				printret(ret)
				ret.status.should.eq(NOT_FOUND)
			})
			it('... locale id is invalid', async () => {
				ret = await updateLocale('invalidid', {
					fallback: { op: '$set', value: 'fr' }
				})
				printret(ret)
				ret.status.should.eq(NOT_FOUND)
			})
		})
	})
})
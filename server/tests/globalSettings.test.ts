import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import app from '../src/app'
import { clearDataBase, createUser, printret, userData, getGlobalSettings, updateGlobalSettings } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { GlobalSettings } from '../src/models'
import { ILocaleSettings } from '../src/interfaces'
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;

describe('Global Setting', function() {
	before(async () => {
		await app.ready
	})

	beforeEach(async function() {
		// Clear database
		await clearDataBase()
		await app.ready
		// Create user
		ret = await createUser(userData)
	})

	it('Should get global settings', async () => {
		ret = await getGlobalSettings()
		ret.status.should.equal(OK)
	})

	describe('Global Setting - Locale - patch', () => {
		describe('Add locale', () => {
			it('Should add a locale to available locales', async () => {
				ret = await updateGlobalSettings({
					locale: { op: '$add', value: 'fr_FR' }
				})
				ret.status.should.eq(OK)
				let localeSettings: ILocaleSettings = (await GlobalSettings.findOne({}).populate({
					path: 'locale.availableLocales',
					populate: {
						path: 'fallback'
					}
				})).locale
				localeSettings.availableLocales.find(x => x.id == 'fr_FR').should.exist
			})
			describe('Should fail if ...', () => {
				it('... locale is invalid', async() => {
					ret = await updateGlobalSettings({
						locale: { op: '$add', value: 'invalid' }
					})
					ret.status.should.eq(NOT_FOUND)
					let localeSettings: ILocaleSettings = (await GlobalSettings.findOne({}).populate({
						path: 'locale.availableLocales',
						populate: {
							path: 'fallback'
						}
					})).locale
					expect(localeSettings.availableLocales.find(x => x.id == 'fr_FR')).to.not.exist
				})
				it('... patch operator is invalid', async() => {
					ret = await updateGlobalSettings({
						locale: { op: '$set', value: 'fr_FR' }
					})
					ret.status.should.eq(BAD_REQUEST)
				})
			})
		})
		describe('Remove locale from available locales', () => {
			it('Should remove a locale from the available locales', async () => {
				ret = await updateGlobalSettings({
					locale: { op: '$add', value: 'fr_FR' }
				})
				ret = await updateGlobalSettings({
					locale: { op: '$remove', value: 'fr_FR' }
				})
				ret.status.should.eq(OK)
				let localeSettings: ILocaleSettings = (await GlobalSettings.findOne({}).populate({
					path: 'locale.availableLocales',
					populate: {
						path: 'fallback'
					}
				})).locale
				expect(localeSettings.availableLocales.find(x => x.id == 'fr_FR')).to.not.exist
			})
			describe('Should fail if ...', () => {
				it('... locale is invalid', async() => {
					ret = await updateGlobalSettings({
						locale: { op: '$add', value: 'fr_FR' }
					})
					ret = await updateGlobalSettings({
						locale: { op: '$remove', value: 'fr_FRRRR' }
					})
					ret.status.should.eq(BAD_REQUEST)
				})
				it('... locale is no available', async() => {
					ret = await updateGlobalSettings({
						locale: { op: '$add', value: 'fr_FR' }
					})
					ret = await updateGlobalSettings({
						locale: { op: '$remove', value: 'fr' }
					})
					ret.status.should.eq(BAD_REQUEST)
				})
			})
		})
	})
})
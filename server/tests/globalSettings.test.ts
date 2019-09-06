import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import app from '../src/app'
import { clearDataBase, createUser, printret, userData, getGlobalSettings, updateGlobalSettings } from './common';
import ResponseStatusTypes from '../src/utils/ResponseStatusTypes'
import { GlobalSettings } from '../src/models';
import { ILocaleSettings } from '../src/interfaces';
const { OK, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = ResponseStatusTypes 

let ret: any;

describe.only('Global Setting', function() {
	before(async () => {
		await app.ready
	})

	before(async function() {
		// Clear database
		await clearDataBase()
		// Create user
		ret = await createUser(userData)
	})

	it('Should get global settings', async () => {
		ret = await getGlobalSettings()
		printret(ret)
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
				it('Locale is invalid')
			})
		})
		describe('Remove locale', () => {
			it.only('Should remove a locale from the available locales', async () => {
				ret = await updateGlobalSettings({
					locale: { op: '$add', value: 'fr_FR' }
				})
				ret.status.should.eq(OK)
				ret = await updateGlobalSettings({
					locale: { op: '$remove', value: 'fr_FR' }
				})
				let localeSettings: ILocaleSettings = (await GlobalSettings.findOne({}).populate({
					path: 'locale.availableLocales',
					populate: {
						path: 'fallback'
					}
				})).locale
				expect(localeSettings.availableLocales.find(x => x.id == 'fr_FR')).to.not.exist
			})
		})
		describe('Set fallback locale', () => {
			it('Should set a fallback to a locale')
		})
		describe('Unset fallback locale', () => {
			it('Should unset (set to default) a fallback of a locale')
		})
	})
})
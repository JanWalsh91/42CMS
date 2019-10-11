import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
import chalk from 'chalk'

import app from '../src/app'
import { Locale } from '../src/models'
import { jsonLocale } from '../src/types'
import { ILocale } from '../src/interfaces'
import { clearDataBase } from './common'

const jsonLocales: { default: jsonLocale[], all: jsonLocale[] } = require('../src/resources/locales.json')

describe('Server', () => {
	before(async () => {
		await app.ready
		await clearDataBase()
		await app.ready
	})

	describe('On Start', () => {
		it('Should create default locales', async() => {
			// Locales should exist
			const locales: ILocale[] = await Promise.all(jsonLocales.default.map(async (config: jsonLocale) => {
				const locale: ILocale = await Locale.findOne({id: config.id}).populate('fallback').exec()
				expect(locale).to.exist
				return locale
			}))

			// Locales with fallbacks should point to locales
			await Promise.all(jsonLocales.default.map(async (config: jsonLocale) => {
				if (config.fallback) {
					let fallback: ILocale = locales.find(x => x.id == config.fallback)
					expect(fallback).to.exist
					locales.find(x => x.id == fallback.id).should.exist
				}
			}))
		})	
	})
})
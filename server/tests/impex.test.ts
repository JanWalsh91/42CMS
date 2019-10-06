import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
const chaiFiles = require('chai-files')
chai.use(chaiFiles)
const file = chaiFiles.file
const dir = chaiFiles.dir
import chalk from 'chalk'
import * as path from 'path'

import app from '../src/app'
import { Locale, Image } from '../src/models'
import { jsonLocale } from '../src/types'
import { ILocale, IImage } from '../src/interfaces';
import { clearDataBase, uploadImage, printret, createUser, userData, removeImages, deleteImage, placeholderImages, exportToXLM, getAllImpexFiles, getImpexFile, writeToFile, getFileName, downloadsPath, createCatalog, createProduct, updateCatalog, createSite, createCategory, productData, updateProduct, updateSite } from './common'
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

	it('Should download a file from impex', async() => {
		const filename: string = 'test.txt'
		let ret = await getImpexFile(filename)
		printret(ret)
		ret.status.should.eq(OK)
		
		let newFilename = getFileName(ret)
		expect(newFilename).eq(filename)
		await writeToFile(ret)
		expect(file(`${downloadsPath}/${newFilename}`)).to.exist
	})

	it.only('Should export all catalogs', async() => {
		ret = await createCatalog('catalog1', { master: true } )
		ret = await createSite('site1')
		ret = await createCategory('catalog1', 'category1')
		ret = await updateCatalog('catalog1', {
			name: { op: '$set', value: 'Beauty' },
			site: { op: '$add', value: 'site1' },
		})
		ret = await createProduct('catalog1', 'product1')
		ret = await updateProduct('product1', {
			assignedCategoriesByCatalog: {
				op: '$add',
				value: 'category1',
				catalog: 'catalog1',
			}
		})
		ret = await createProduct('catalog1', 'product2')
		ret = await updateProduct('product2', {
			assignedCategoriesByCatalog: {
				op: '$add',
				value: 'category1',
				catalog: 'catalog1',
			}
		})
		ret = await updateCatalog('catalog1', {
			sites: { op: '$add', value: 'site1' }
		})

		ret = await exportToXLM('myexport.xml', ['Catalog'])
		printret(ret)
		ret.status.should.eq(OK)

		// let newFilename = getFileName(ret)
		// await writeToFile(ret)
		// expect(file(`${downloadsPath}/${newFilename}`)).to.exist
	})
})

// describe('Import', () => {

// })
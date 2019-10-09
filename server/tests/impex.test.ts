import * as chai from 'chai'
chai.should()
const expect = require('chai').expect
const chaiFiles = require('chai-files')
chai.use(chaiFiles)
const file = chaiFiles.file
import chalk from 'chalk'
import * as fs from 'fs'

import app from '../src/app'
import { clearDataBase, printret, createUser, userData, exportToXLM, getAllImpexFiles, getImpexFile, writeToFile, getFileName, downloadsPath, createCatalog, createProduct, updateCatalog, createSite, createCategory, updateProduct } from './common'
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
		console.log('START TEST')
		// const filename: string = 'myexport.xml'
		const filename: string = 'test.txt'

		fs.writeFileSync(`./server/impex/${filename}`, 'test file contents')

		ret = await getImpexFile(filename)
		console.log('AFTER GET IMPEX FILE')
		printret(ret)
		ret.status.should.eq(OK)
		
		let newFilename = getFileName(ret)
		expect(newFilename).eq(filename)
		await writeToFile(ret)
		expect(file(`${downloadsPath}/${newFilename}`)).to.exist

		fs.unlinkSync(`${downloadsPath}/${filename}`)
		fs.unlinkSync(`./server/impex/${filename}`)
	})

	it('Should export all catalogs, categories and download file', async() => {
		let filename: string = 'myexport.xml'

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
			},
		})
		ret = await createProduct('catalog1', 'product2')
		ret = await updateProduct('product2', {
			assignedCategoriesByCatalog: {
				op: '$add',
				value: 'category1',
				catalog: 'catalog1',
			},
			primaryCategoryByCatalog: {
				op: '$set',
				value: 'category1',
				catalog: 'catalog1',
			},
			description: [
				{
					op: '$set',
					value: 'This describes my product in default'
				},
				{
					op: '$set',
					value: 'This describes my product in EN',
					locale: 'en'
				},
			]
		})

		ret = await updateCatalog('catalog1', {
			sites: { op: '$add', value: 'site1' }
		})

		ret = await exportToXLM(filename, ['Catalog'])
		printret(ret)
		ret.status.should.eq(OK)

		ret = await getImpexFile(filename)
		await writeToFile(ret)

		expect(file(`${downloadsPath}/${filename}`)).to.exist

		fs.unlinkSync(`${downloadsPath}/${filename}`)
		fs.unlinkSync(`./server/impex/${filename}`)

		filename = 'productexports.xml'

		ret = await exportToXLM(filename, ['Product'])
		printret(ret)
		ret.status.should.eq(OK)

		ret = await getImpexFile(filename)
		await writeToFile(ret)

		expect(file(`${downloadsPath}/${filename}`)).to.exist

		fs.unlinkSync(`${downloadsPath}/${filename}`)
		fs.unlinkSync(`./server/impex/${filename}`)
	})
})

// describe('Import', () => {

// })
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

import { Product, Catalog, Category, ProductMaster, ProductVariant } from '../models'
import { IProduct, ICatalog, ICategory, IGlobalSettings, IProductVariant, IObjectTypeDefinition, IObjectAttributeDefinition, IProductMaster } from '../interfaces'
import { ResourceNotFoundError, ValidationError, patchRequest, Patchable, patchAction, NotImplementedError } from '../utils'
import { catalogService, categoryService, globalSettingsService, objectTypeDefinitionService, localizableAttributeService } from '.'

export const impexRoute: string = path.join(__dirname, '../../impex'); 

export const impexService = {
	
	getAllFilesnames(): Promise<string[]> {
		console.log(chalk.magenta(`[ImpexService.getAllFilesnames]`))

		return new Promise((resolve, reject) => {
			fs.readdir(impexRoute, (err, files: string[]) => {
				if (err) {
					reject(err)
				} else {
					resolve(files)
				}
			})
		})
	},

	// getFile(filename: string): Promise<Buffer> {
	// 	console.log(chalk.magenta(`[ImpexService.filename]`))
		
	// 	return new Promise((resolve, reject) => {
	// 		fs.readFile(path.join(impexRoute, filename), (err, data: Buffer) => {
	// 			if (err) {
	// 				reject(err)
	// 			} else {
	// 				return data
	// 			}
	// 		})
	// 	})
	// }
}
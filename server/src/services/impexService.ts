import * as fs from 'fs'
import * as path from 'path'

export const impexRoute: string = path.join(__dirname, '../../impex')

export const impexService = {
	
	getAllFilesnames(): Promise<string[]> {
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
}
import { Model, Document } from "mongoose";
import chalk from "chalk";

import { IProject } from '../models/projectModel';
import { ICatalog } from '../models/catalogModel';
import { ICategory } from '../models/categoryModel';

type ModelsWithId = IProject | ICatalog | ICategory;

export const hasUniqueIdInProject = () => {
	return {
		validator: function(v: string) {
			return new Promise((resolve, reject) => {
				console.log(chalk.red('Catalog.id validation isUniqueInProject', v))
					this.constructor
						.find({
							project: this.project
						})
						.then((documents: ModelsWithId[]) => {
							resolve(!documents.some((document: ModelsWithId) => document.id === v))
						})
						.catch(e => {
							console.log(chalk.red('catch err', e))
							reject(false)
						})
			});
		},
		message: `Must prodive a unique id`
	}
}
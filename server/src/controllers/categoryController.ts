import { Project, IProject } from '../models/projectModel'
import { ICategory } from '../models/categoryModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ServerError, ErrorType } from '../utils/ServerError';
import { ICatalog } from '../models/catalogModel';
import { prependOnceListener } from 'cluster';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CategoryController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CategoryController] create'), req.body);
		let catalog: ICatalog = req.body.catalog
		let project: IProject = req.body.project
		let { name, id, parentCategoryId } = req.body // User acquired from authorization middleware
	   
		let parentCategory = null
		if (parentCategoryId) {
			parentCategory = catalog.getCategory({id: parentCategoryId})
		} else {
			parentCategory.rootCategory;
		}

		const newCategory = {
			parentCategory: parentCategory ? parentCategory._id : null,
			id,
			name
		};

		let existingCategory: ICategory = catalog.getCategory({id})
		if (existingCategory) {
			res.status(BAD_REQUEST)
			console.log(chalk.red(`[CategoryController.create] Catalog with id already exists`))
			res.send(new ServerError(ErrorType.CATEGORY_EXISTS, id))
			return
		}

		// try {
		// 	// let newCategory = await addCategoryToCatalog();
		// 	console.log({newCategory});
		// 	if (parentCategory) {
		// 		// await linkCategories({parent: })
		// 	}
		// } catch (e) {
		// 	console.log('catch', e)
		// }
		// let promises = [addCategoryToCatalog()];
		// if (parentCategory) {
		// 	promises.push(linkCategories());
		// }
		// try {
		// 	await Promise.all(promises);
		// } catch (e) {
		// 	console.log(chalk.red('ERROR'))
		// }
		res.end()
		// res.send(newCategory)

		// function addCategoryToCatalog() {
		// 	return new Promise((resolve, reject) => {
		// 		Project.findOneAndUpdate(
		// 			// Get current project only if category doesn't already exist in catalog
		// 			{
		// 				id: project.id,							// update project
		// 				catalogs: {
		// 					$elemMatch: { id: catalog.id, },	// update catalog
		// 				},
		// 			},
		// 			{
		// 				$push: {
		// 					'catalogs.$.categories': newCategory
		// 				},
		// 			},
		// 			// Return updated Project in callback
		// 			{ new: true },
		// 			(err, project: IProject) => {
		// 				if (err) {
		// 					console.log(chalk.blue('addCategoryToCatalog CALLBACK err: '), err);
		// 					reject({err})
		// 					return 
		// 				}
		// 				if (!project) {
		// 					console.log(chalk.blue('addCategoryToCatalog CALLBACK no project: '));
		// 					reject('No project found')
		// 					return 
		// 				}
		// 				resolve(project.getCatalog({id: catalog.id}).getCategory({id}))
		// 			}
		// 		)
		// 	})
		// }

		// function linkCategories() {
		// 	return new Promise(async (resolve, reject) => {
		// 		project = await Project.findOne({id: project.id})
		// 		let newCat: ICategory = project.getCatalog({id: catalog.id}).getCategory({id})
		// 		Project.findOneAndUpdate(
		// 			{ id: project.id },
		// 			{
		// 				catalogs: {
		// 					$elemMatch: {
		// 						id: catalog.id,
		// 						categories: {
		// 							id: parentCategoryId,
		// 							$push: {
		// 								subcategories: newCat._id
		// 							}
		// 						}
		// 					}
		// 				}
		// 			},
		// 			(err, project: IProject) => {
		// 				console.log(chalk.blue('linkCategories CALLBACK'));
		// 				console.log({err, project})
		// 				resolve();
		// 			}
		// 		)
		// 	})
		// }

		
		// TODO: create refrences between child and parent categories

	
	}
}

export const categoryController: CategoryController = new CategoryController();

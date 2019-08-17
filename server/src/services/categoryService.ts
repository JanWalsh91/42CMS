import { ICategory, Category, ICatalog, Catalog } from "../models";
import { ValidationError, ResourceNotFoundError } from "../utils/Errors"
import { catalogService } from '../services' 
import chalk from "chalk";

class CategoryService {
	/**
	 * @description Create a category. If options.parent, sets parent category, else sets parent as root, else if root doesn't exist, set 
	 * @param options 
	 */
	public async create(options: Partial<ICategory>): Promise<ICategory> {
		console.log(chalk.blue('[CategoryService.create]'), options)
		const catalog: ICatalog = await catalogService.getById(options.catalog)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog', options.catalog)
		}

		const existingCategory: ICategory = await catalog.getCategory({id: options.id})
		if (existingCategory) {
			throw new ValidationError('Category already exists in this catalog')
		}
		
		// Create new category
		let category: ICategory = await new Category({
			id: options.id,
			name: options.name,
			catalog
		}).save()

		// Add category to catalog
		await catalog.addCategory(category)

		// Link to parent category
		if (options.id != 'root') {
			var parentCategory: ICategory = null
			if (options.parent) {
				parentCategory = await catalog.getCategory({id: options.parent})
			} else {
				parentCategory = await catalog.getCategory({id: 'root'});
			}
			if (!parentCategory) {
				throw new ResourceNotFoundError('Category', options.parent || 'root')
			}
			await this.linkCategories(parentCategory, category)
			await parentCategory.save()
		}
		return await category.save()
	}
	
	public async getById(id: string): Promise<ICategory> {
		return Category.findOne({id}).exec()
	}

	public async findAll(query: object): Promise<ICategory[]> {
		return Category.find(query).exec()
	}

	public async getAll(): Promise<ICategory[]> {
		// TODO: format user object for front end user
		return Category.find({}).exec()
	}

	public async delete(category: ICategory): Promise<void> {
		console.log(chalk.magenta('[categoryService.delete]' +  category.id))
		await category.populate([{path: 'catalog'}, {path: 'parent'}, {path: 'subCategories'}]).execPopulate()
		// Remove category from catalog
		// TODO: unless root?
		if (category.catalog) {
			await category.catalog.removeCategory(category)
			await category.catalog.save()
		}
		// Unlink category from parent
		if (category.parent) {
			const { parent, child } = await this.unlinkCategories(category.parent, category)
			await parent.save()
		}
		// Unlink category from subCategories
		if (category.subCategories) {
			await category.subCategories.reduce(async(_: Promise<void>, subcat: ICategory) => {
				return _.then(async () => {
					await this.unlinkCategories(category, subcat)
					await subcat.save()
				})
			}, Promise.resolve())
		}
		// TODO: remove product assignments
		await Category.findOneAndDelete({id: category.id})
	}


	// ! does not save
	public async linkCategories(parent: ICategory, child: ICategory): Promise<{parent: ICategory, child: ICategory}> {
		console.log(chalk.magenta(`[CategoryService.linkCategories] parent: ${parent.id}, child: ${child.id}`))

		await Promise.all([
			parent.addSubCategory(child),
			child.setParent(parent)
		])
		return { parent, child }
	}

	// ! does not save
	public async unlinkCategories(parent: ICategory, child: ICategory): Promise<{parent: ICategory, child: ICategory}> {
		console.log(chalk.magenta(`[CategoryService.unlinkCategories] parent: ${parent.id}, child: ${child.id}`))
		await Promise.all([
			parent.removeSubCategory(child),
			child.setParent(null)
		])
		return { parent, child }
	}
}

export const categoryService: CategoryService = new CategoryService()
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
	
	public async findAll(query: object): Promise<ICategory[]> {
		return Category.find(query).exec()
	}

	public async getAll(): Promise<ICategory[]> {
		// TODO: format user object for front end user
		return Category.find({}).exec()
	}

	public async update(category: ICategory, update: Partial<{name: string, id: string, parentId: string}>): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryService.update]`), update)
		await Object.keys(update)
			.filter(key => update[key] != undefined)
			.reduce((_, key: string) => {
				console.log('reducing ', key, update[key])
				return _.then(() => this[`update_${key}`](category, update[key]))
			}, Promise.resolve())
		return category.save()
	}

	public async update_name(category: ICategory, name: string): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryService.updateName] ${name}`))
		category.name = name
		return category
	}

	public async update_id(category: ICategory, id: string): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryService.updateID] ${id}`))
		await category.populate('catalog').execPopulate()
		if (await category.catalog.getCategory({id})) {
			throw new ValidationError(`Category with id ${id} already exists in this catalog`)
		}
		category.id = id
		return category
	}

	// Updates and saves parents, does not save category
	public async update_parentId(category: ICategory, parentId: string): Promise<ICategory> {
		console.log(chalk.magenta(`[CategoryService.updateParent] ${parentId}`))
		await category.populate([{path: 'catalog'}, {path: 'parent'}]).execPopulate()
		
		const parentCategory: ICategory = await category.catalog.getCategory({id: parentId})
		if (!parentCategory) {
			throw new ResourceNotFoundError('Category', parentId)
		}
		if (category.parent) {
			const { parent, child } = await this.unlinkCategories(category.parent, category)
			await parent.save()
		}
		await this.linkCategories(parentCategory, category)
		await parentCategory.save()
		return category
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
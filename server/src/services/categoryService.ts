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
			throw new ValidationError('Category already exists')
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
		// TODO: format user object for non Database use
		return Category.find({}).exec()
	}

	public async deleteCategory(id: string): Promise<void> {
		let user: ICategory = await this.getById(id)
		if (!user) {
			throw new ResourceNotFoundError('Category', id)
		}
		await Category.findOneAndDelete({id})
	}

	public async linkCategories(parent: ICategory, child: ICategory): Promise<{parent: ICategory, child: ICategory}> {
		console.log(chalk.magenta(`linkCategories. parent: ${parent.id} child: ${child.id}`))
		await Promise.all([
			parent.addSubCategory(child._id),
			child.setParent(parent._id),
		])
		return { parent, child }
	}

	static async unlinkCategories(parent: ICategory, child: ICategory): Promise<{parent: ICategory, child: ICategory}> {
		console.log(chalk.magenta(`unlinkCategories. parent: ${parent.id} child: ${child.id}`))
		await Promise.all([
			parent.removeSubCateory(child._id),
			child.setParent(null),
		])
		return { parent, child }
	}
}

export const categoryService: CategoryService = new CategoryService()
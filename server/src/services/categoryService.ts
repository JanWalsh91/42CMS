import { ICategory, Category, ICatalog, Catalog } from "../models";
import { ValidationError, ResourceNotFoundError } from "../utils/Errors"
import { catalogService } from '../services' 

class CategoryService {
	public async create(options: Partial<ICategory>): Promise<ICategory> {
		const catalog: ICatalog = await catalogService.getById(options.catalog)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog', options.catalog)
		}
		const existingCategory: ICategory = await catalog.getCategory({id: options.id})
		if (existingCategory) {
			throw new ValidationError('Category already exists')
		}
		if (options.id != 'root') {
			var parentCategory: ICategory = null
			if (options.parent) {
				parentCategory = await catalog.getCategory({id: options.parent})
			}
			if (!parentCategory && options.id != 'root') {
				parentCategory = await catalog.getCategory({id: 'root'});
			}
			if (!parentCategory) {
				throw new ResourceNotFoundError('Category', options.parent || 'root')
			}
		}

		// Create new category
		return await new Category({
			id: options.id,
			name: options.name,
			parent: parentCategory ? parentCategory._id : null,
			catalog
		}).save()
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
}

export const categoryService: CategoryService = new CategoryService()
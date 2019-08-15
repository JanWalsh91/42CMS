import { ICategory, Category } from "../models";
import { ValidationError, ResourceNotFoundError } from "../utils/Errors";
import { uuid } from "../utils/uuid";

class CategoryService {
	public async create(options: Partial<ICategory>): Promise<ICategory> {
		// Check if category exists
		let existingCategorys: ICategory[] = await Category.find({id: options.id})
		if (existingCategorys.length > 0) {
			throw new ValidationError('Category already exists')
		}
		
		// Create new category
		return await new Category({
			id: options.id,
			name: options.name,
		}).save()
	}

	public async getById(usernamae: string): Promise<ICategory> {
		return Category.findOne({usernamae}).exec()
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

export const userService: CategoryService = new CategoryService()
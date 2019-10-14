import { Category } from '../models'
import { ICategory, ICatalog, IProduct } from '../interfaces'
import { ValidationError, ResourceNotFoundError, Patchable, patchAction, patchRequest } from '../utils'
import { catalogService } from '.' 

class CategoryService extends Patchable<ICategory> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	patchMap = {
		id: {
			$set: async (category: ICategory, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setId(category, action.value)
			}
		},
		name: {
			$set: async (category: ICategory, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await category.setName(action.value)
			}
		},
		parent: {
			$set: async (category: ICategory, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.updateParent(category, action.value)
			}
		}
	}
	/**
	 * @description Create a category. If options.parent, sets parent category, else sets parent as root, else if root doesn't exist, set 
	 * @param options 
	 */
	public async create(options: Partial<ICategory>): Promise<ICategory> {
		let category: ICategory;
		
		const catalog: ICatalog = await catalogService.getById(options.catalog)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog', options.catalog)
		}

		const existingCategory: ICategory = await catalog.getCategory({id: options.id})
		if (existingCategory) {
			throw new ValidationError('Category already exists in this catalog')
		}
		
		// Create new category
		category = await new Category({
			id: options.id,
			name: options.name,
			catalog
		}).save()

		let parentCategory: ICategory = null
		try {
			// Add category to catalog
			await catalogService.addCategory(catalog, category)
	
			// Link to parent category
			if (options.id != 'root') {
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
				await category.save()
			}
		} catch (e) {
			if (parentCategory) {
				await this.unlinkCategories(parentCategory, category)
			}
			await catalogService.delete(catalog)
			throw e
		}

		return category
	}
	
	public async findAll(query: object): Promise<ICategory[]> {
		return Category.find(query).exec()
	}

	public async getAll(): Promise<ICategory[]> {
		return Category.find({}).exec()
	}

	public async update(category: ICategory, patchRequest: patchRequest, resources: any): Promise<ICategory> {
		await this.patch(category, patchRequest, resources)
		return category.save()
	}

	public async setName(category: ICategory, name: string): Promise<ICategory> {
		await category.setName(name)
		return category
	}

	public async setId(category: ICategory, id: string): Promise<ICategory> {
		await category.populate('catalog').execPopulate()
		if (await category.catalog.getCategory({id})) {
			throw new ValidationError(`Category with id ${id} already exists in this catalog`)
		}
		await category.setId(id)
		return category
	}

	// Updates and saves parents, does not save category
	public async updateParent(category: ICategory, parentId: string): Promise<ICategory> {
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
		await category.populate([
			{ path: 'catalog' },
			{ path: 'parent' },
			{ path: 'subCategories' },
			{ path: 'products' },
		]).execPopulate()
		
		// Remove category from catalog
		if (category.catalog) {
			await catalogService.removeCategory(category.catalog, category)
		}
		
		// Unlink category from parent
		if (category.parent) {
			const { parent, child } = await this.unlinkCategories(category.parent, category)
			await parent.save()
		}
		
		// Unlink category from subCategories
		if (category.subCategories) {
			await category.subCategories.reduce(async(_, subcat: ICategory) => {
				return _.then(async () => {
					await this.unlinkCategories(category, subcat)
					await subcat.save()
				})
			}, Promise.resolve())
		}
		
		// Remove product assignments
		if (category.products) {
			await category.products.reduce(async(_, product: IProduct) => 
				_.then(() => product.removeAssignedCategoryByCatalog(category, category.catalog)),
				Promise.resolve())
		}

		// Delete Category
		await Category.findOneAndDelete({id: category.id})
	}


	// ! Does not save categories
	public async linkCategories(parent: ICategory, child: ICategory): Promise<{parent: ICategory, child: ICategory}> {
		await child.populate('parent').execPopulate()

		if (parent.id == child.id) {
			throw new ValidationError('Invalid parent category (self)')
		}

		let p: ICategory = parent
		while (p) {
			if (p.id == child.id) {
				throw new ValidationError('Invalid parent category (loop)')
			}
			await p.populate('parent').execPopulate()			
			p = p.parent
		}

		await Promise.all([
			parent.addSubCategory(child),
			child.setParent(parent)
		])
		return { parent, child }
	}

	// ! Does not save categories
	public async unlinkCategories(parent: ICategory, child: ICategory): Promise<{parent: ICategory, child: ICategory}> {
		await Promise.all([
			parent.removeSubCategory(child),
			child.setParent(null)
		])
		return { parent, child }
	}

	public async categoryToXMLJSON(category: ICategory): Promise<any> {
		await category.populate([
			{ path: 'products' },
			{ path: 'subCategories' },
			{ path: 'parent' },
			{ path: 'catalog' },
		]).execPopulate()

		return {
			'@category-id': category.id,
			name: {
				'#text': category.name ? category.name : null 
			},
			parent: {
				'@category-id': category.parent ? category.parent.id : null,
			},
			subcategories: {
				category: category.subCategories.map((category: ICategory) => ({
					'@category-id': category.id,
				}))
			},
			products: {
				product: await Promise.all(category.products.map(async (product: IProduct) => ({
					'@product-id': product.id,
					'@primary-category': await new Promise(async (resolve) => {
						const primaryCat: ICategory = await product.getPrimaryCategoryByCatalog(category.catalog)
						resolve(!!primaryCat && (primaryCat.id == category.id))
					})
				})))
			}
		}
	}
 }

export const categoryService: CategoryService = new CategoryService()
import { IProduct, Product } from "../models";

export class ProductService {
	public async create(options: Partial<IProduct>) {
		// TODO: check required params? or leave it to Mongoose?

		let product: IProduct = await new Product(options);
		product = await product.save()
		return product
	}

	// for simple properties
	public async update() {

	}

	public async delete() {

	}
	
}

export const productService: ProductService = new ProductService();
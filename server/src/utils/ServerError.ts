import { Error } from "mongoose";

export class ServerError extends Error {
	code: number
	message: string

	constructor(code: ErrorType, message?: string) {
		super(message)
		this.code = code;
		this.message = ErrorMessages[code](message);
	}
}

export enum ErrorType {
	FORBIDDEN,
	UNAUTHORIZED,
	USER_EXISTS,
	CATALOG_EXISTS,
	CATEGORY_EXISTS,
	PRODUCT_EXISTS,
	BAD_LOGIN,
	// VALIDATION_ERROR,
}

export const ErrorMessages: {[code: string]: Function} = {
	[ErrorType.FORBIDDEN]: () => 'Forbidden',
	[ErrorType.UNAUTHORIZED]: () => `You are unauthorized to access this resource`,
	[ErrorType.USER_EXISTS]: username => `User ${username ? username + ' ' : ''}already exists`,
	[ErrorType.CATALOG_EXISTS]: catalogid => `Catalog ${catalogid ? catalogid + ' ' : ''}already exists`,
	[ErrorType.CATEGORY_EXISTS]: categoryid => `Category ${categoryid ? categoryid + ' ' : ''}already exists`,
	[ErrorType.PRODUCT_EXISTS]: productid => `Product ${productid ? productid + ' ' : ''}already exists`,
	[ErrorType.BAD_LOGIN]: () => `Wrong username or password`,
	// [ErrorType.VALIDATION_ERROR]: (e: Error.ValidationError) => `Wrong username or password`,
}
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

	PROJECT_EXISTS,
	USER_EXISTS,
	PRODUCT_EXISTS,
	CATALOG_EXISTS,
	CATEGORY_EXISTS,

	PROJECT_NOT_FOUND,
	USER_NOT_FOUND,
	PRODUCT_NOT_FOUND,
	CATALOG_NOT_FOUND,
	CATEGORY_NOT_FOUND,
	
	BAD_LOGIN,
	// VALIDATION_ERROR,
}

export const ErrorMessages: {[code: string]: Function} = {
	[ErrorType.FORBIDDEN]: () => 'Forbidden',
	[ErrorType.UNAUTHORIZED]: () => `You are unauthorized to access this resource`,
	
	[ErrorType.PROJECT_EXISTS]: projectid => `Project ${projectid ? projectid + ' ' : ''}already exists`,
	[ErrorType.USER_EXISTS]: username => `User ${username ? username + ' ' : ''}already exists`,
	[ErrorType.PRODUCT_EXISTS]: productid => `Product ${productid ? productid + ' ' : ''}already exists`,
	[ErrorType.CATALOG_EXISTS]: catalogid => `Catalog ${catalogid ? catalogid + ' ' : ''}already exists`,
	[ErrorType.CATEGORY_EXISTS]: categoryid => `Category ${categoryid ? categoryid + ' ' : ''}already exists`,
	
	[ErrorType.PROJECT_NOT_FOUND]: projectid => `Project ${projectid ? projectid + ' ' : ''}not found`,
	[ErrorType.USER_NOT_FOUND]: username => `User ${username ? username + ' ' : ''}not found`,
	[ErrorType.PRODUCT_NOT_FOUND]: productid => `Product ${productid ? productid + ' ' : ''}not found`,
	[ErrorType.CATALOG_NOT_FOUND]: catalogid => `Catalog ${catalogid ? catalogid + ' ' : ''}not found`,
	[ErrorType.CATEGORY_NOT_FOUND]: categoryid => `Category ${categoryid ? categoryid + ' ' : ''}not found`,

	[ErrorType.BAD_LOGIN]: () => `Wrong username or password`,
	// [ErrorType.VALIDATION_ERROR]: (e: Error.ValidationError) => `Wrong username or password`,
}
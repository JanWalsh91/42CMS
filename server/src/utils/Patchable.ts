import chalk from 'chalk'
import { Document } from 'mongoose'

import { ValidationError, ServerError } from '.'
import { localizableAttributeService } from '../services'
import { IObjectAttributeDefinition, IObjectTypeDefinition, IExtensibleObject, ILocalizableAttribute } from '../interfaces'
import { isExtensibleObject } from '../typeguards';

export type patchOperation = '$add' | '$remove' | '$set' | '$unset'

export const patchOperations = ['$add', '$remove', '$set', '$unset']

export type patchAction = {
	op: patchOperation,
	[key: string]: any
}

export type patchRequest = {
	[key: string]: patchAction | patchAction[]
}

export type patchFunction<T> = (x: T, action: patchAction) => Promise<void> | void

export type patchMap<T> = {
	[key: string]: Partial<Record<patchOperation, patchFunction<T>>>
}

export abstract class Patchable<T> {
	protected abstract patchMap: patchMap<T>
	protected abstract hasObjectTypeDefinition: boolean
	protected abstract getObjectTypeDefinition(): Promise<IObjectTypeDefinition>
	protected async patch(object: T, patch: patchRequest, resources: any): Promise<void> {
		// Parses the patchRequest and calls on update functions for each patch action
		for (let [key, value] of Object.entries(patch)) {
			console.log(chalk.keyword('salmon')(`\n========== PATCH: ${key} ==========\n`), value)
			console.log(chalk.keyword('salmon')('=============================='))
			if (isPatchAction(value)) {
				await this.executeAction(object, key, {...value, resources})
			} else if (isArrayOfPatchActions(value)) {
				await value.reduce((_, patchAction: patchAction) => _.then(() => this.executeAction(object, key, {...patchAction, resources})), Promise.resolve())
			} else {
				console.log(chalk.red('Bad value: '), value)
			}
		}
	}

	private async executeAction(object: T, key: string, action: patchAction) {
		// console.log('execute action', action)
		if (this.patchMap.hasOwnProperty(key)) {
			if (this.patchMap[key].hasOwnProperty(action.op)) {
				await this.patchMap[key][action.op](object, action)
			} else {
				throw new ServerError(400, `action ${action.op} for ${key} is not available`)
			}
		} else if (this.hasObjectTypeDefinition) {
			const OTD: IObjectTypeDefinition = await this.getObjectTypeDefinition()
			const OAD: IObjectAttributeDefinition = OTD.getAttribute(key)
			let localizedAttribute: ILocalizableAttribute;
			if (OAD && OAD.system) {
				localizedAttribute = object[key]
			} else {
				if (isExtensibleObject(object)) {
					localizedAttribute = object.custom.get(key)
				} else {
					throw new ServerError(400, `invalid property [${key}]`)
				}
			}
			if (OAD) {
				await localizableAttributeService.update(
					localizedAttribute,
					OAD,
					key,
					action
				)
			} else {
				throw new ServerError(400, `invalid property [${key}]`)
			}
		}
	}

	protected checkRequiredProperties(action: patchAction, props: any[]) {
		if (!props.every(prop => action.hasOwnProperty(prop))) {
			throw new ValidationError('Invalid patch action')
		}
	}
}

function isPatchAction(action: any): action is patchAction {
	return action.hasOwnProperty('op') && patchOperations.includes(action.op)
}

function isArrayOfPatchActions(action: any): action is patchAction[] {
	return Array.isArray(action) && action.every(isPatchAction)
}

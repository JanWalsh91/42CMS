import chalk from 'chalk'

import { ValidationError } from '.';

export type patchOperation = '$add' | '$remove' | '$set' | '$unset'

export type patchAction = {
	op: patchOperation,
	[key: string]: any
}

export type patchRequest = {
	[key: string]: patchAction | patchAction[]
}

export type patchFunction = (action: patchAction) => Promise<void> | void

export type patchMap = {
	[key: string]: Partial<Record<patchOperation, patchFunction>>
}

export abstract class Patchable {
	protected abstract patchMap: patchMap
	protected async patch(patch: patchRequest, resources: object): Promise<void> {
		console.log('======== PATCH =======')
		console.log(this)
		
		// Parses the patchRequest and calls on update functions
		console.log('==== parse ====')
		for (let [key, value] of Object.entries(patch)) {
			console.log(`key: ${key}, value: `, value)
			if (!this.patchMap.hasOwnProperty(key)) {
				throw `invalid property [${key}]: property not in patchMap`
			}
			if (isPatchAction(value)) {
				console.log(chalk.green('is patchAction: '), value)
				await this.executeAction(key, {...value, resources})
			} else if (isArrayOfPatchActions(value)) {
				console.log(chalk.green('is patchAction[]: '), value)
				await (value as patchAction[]).reduce((_, value: patchAction) => _.then(() => this.executeAction(key, {...value, resources})), Promise.resolve())
			} else {
				console.log(chalk.red('Bad value: '), value)
				// Ignore, unless implement deeper stuff later
			}
		}
	}

	private async executeAction(key: string, action: patchAction) {
		console.log('executeAction', key, action)
		if (!this.patchMap[key].hasOwnProperty(action.op)) {
			throw `action ${action.op} for ${key} is not available`
		}
		await this.patchMap[key][action.op](action)
	}

	protected checkRequiredProperties(action: patchAction, props: any[]) {
		if (!props.every(prop => action.hasOwnProperty(prop))) {
			throw new ValidationError('Invalid patch action')
		}
	}
}

function isPatchAction(action: any): action is patchAction {
	return action.hasOwnProperty('op')
}

function isArrayOfPatchActions(action: any): action is patchAction[] {
	return Array.isArray(action) && action.every(isPatchAction)
}

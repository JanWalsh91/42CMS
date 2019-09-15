import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';
import { globalSettingsService } from '../services';
import { IGlobalSettings } from '../interfaces';

export class GlobalSettingsController {

	public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[GlobalSettingsController.get]'));
		try {
			const globalSettings: IGlobalSettings = await globalSettingsService.get()
			res.send(globalSettings)
		} catch (e) { next(e) }
	}

	public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController.update]'))
		const globalSettings: IGlobalSettings = await globalSettingsService.get()
		
		try {
			await globalSettingsService.update(globalSettings, req.body, {})
			res.end()
		} catch (e) { next(e) }
	
	}

}

export const globalSettingsController: GlobalSettingsController = new GlobalSettingsController();

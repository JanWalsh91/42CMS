import { Request, Response } from "express";
import { UserController } from "../controllers/user";
import { ProjectController } from "../controllers/project";

export class Routes {
	public userController: UserController = new UserController();
	public projectController: ProjectController = new ProjectController();

	public routes(app): void {
		app.route('/')
		.get((req: Request, res: Response) => {
			res.status(200).send({
				message: 'GET request successfulll!!!!'
			})
		});

		app.route('/users')
			.post(this.userController.create);
		app.route('/users/:userid')
			.get(this.userController.get)
			.post(this.userController.update)
			.delete(this.userController.delete);
		
		app.route('/projects')
			.post(this.projectController.create);
	}
}
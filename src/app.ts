import * as mongoose from 'mongoose';
import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/routes";

class App {

	public app: express.Application;
	public routes: Routes = new Routes();

    constructor() {
        this.app = express();
		this.config();
		this.routes.routes(this.app); 
    }

    private config(): void{
		console.log('setting up config')
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
		this.app.use(bodyParser.urlencoded({ extended: false }));
		mongoose.connect('mongodb://127.0.0.1:27017/MYDB', { useNewUrlParser: true })
		let db = mongoose.connection;
		db.on('error', err => {
			console.log('err: ', err)
		});
		console.log('setting up config DONE')
    }
}

export default new App().app;
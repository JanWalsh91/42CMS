import * as mongoose from 'mongoose';
import * as express from "express";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as session from 'express-session';

import ResponseStatusTypes from "./utils/ResponseStatusTypes";

import routes from './routes';

class App {

	public app: express.Application;
	private static salt: string = "$2b$05$PD21LwJzPhCGI8XjSPcHzO";

    constructor() {
        this.app = express();
		this.config();
		this.app.use('/', routes);
    }

    private config(): void{
		this.app.disable('x-powered-by');
		this.app.use(express.static('public'))
        this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));
		// allow client delivered by webpack server to access this server
		this.app.use(cors({
			origin: ['http://localhost:8080'], // TODO: centralize configs
			credentials: true
		}));

		mongoose.set('useFindAndModify', false);
		
		mongoose.connect('mongodb://127.0.0.1:27017/MYDB', { useNewUrlParser: true })
		let db = mongoose.connection;
		// mongoose.set('debug', true)
		db.on('error', err => {
			console.log('err: ', err)
		});
		// set up session
		const sessionParams = {
			name: 'sessionname',
			secret: 'supersecret',
			saveUninitialized: false,
			rolling: false,
			resave: false,
			cookie: {
				sameSite: true,
				maxAge: 30 * 60 * 1000,
				// httpOnly: true,
				secure: false
			}
		}
		this.app.use(session(sessionParams));
		// hash passwords
		this.app.use(this.hashPassword);
	}
	
	private async hashPassword(req: Request, res: Response, next:Function): Promise<any> {
		if (!req.hasOwnProperty('body') || !req.body.hasOwnProperty('password')) {
			next();
			return ;
		}
		if (typeof req.body.password !== 'string') {
			res.status(ResponseStatusTypes.BAD_REQUEST).send({message: 'Password must be a string'});
			return ;
		}
		if (req.body.password.length < 6) {
			res.status(ResponseStatusTypes.BAD_REQUEST).send({message: 'Password too short'});
			return ;
		}
		if (req.body.password.length > 72) {
			res.status(ResponseStatusTypes.BAD_REQUEST).send({message: 'Password too long'});
			return ;
		}
		req.body.password = bcrypt.hashSync(req.body.password, App.salt);
		next();
	}
}

export default new App().app;
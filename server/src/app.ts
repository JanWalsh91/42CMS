import * as mongoose from 'mongoose';
import * as express from "express";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as session from 'express-session';
// import * as redis from 'redis';
// import * as connectRedis from 'connect-redis'
// const redisStore: connectRedis.RedisStore = connectRedis(session);
// const client: redis.RedisClient = redis.createClient()

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
		console.log('setting up config')
		this.app.use(express.static('public'))
        this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
		this.app.use(cors({
			origin: '*',
			credentials: true,
			allowedHeaders: ['Content-Type', 'Authorization']
		}));

		mongoose.connect('mongodb://127.0.0.1:27017/MYDB', { useNewUrlParser: true })
		let db = mongoose.connection;
		db.on('error', err => {
			console.log('err: ', err)
		});
		// hash passwords
		this.app.use(this.hashPassword);
		// set up session
		const sessionParams = {
			name: 'session',
			secret: 'supersecret',
			saveUninitialized: true,
			// store: new redisStore({ host: 'localhost', port: 6379, client, ttl: 260 }),
			// resave: true
			cookie: {
				maxAge: 6000000,
				httpOnly: false
			}
		}
		this.app.use(session(sessionParams));
		console.log('setting up config DONE')
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
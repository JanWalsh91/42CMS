import * as mongoose from 'mongoose'
import * as express from "express"
import { Request, Response, NextFunction } from "express"
import * as bcrypt from "bcrypt"
import * as bodyParser from "body-parser"
import * as cors from 'cors'
import * as session from 'express-session'
import chalk from 'chalk'

import ResponseStatusTypes from "./utils/ResponseStatusTypes"
const { SERVER_ERROR } = ResponseStatusTypes

import { globalSettingsService, objectTypeDefinitionService } from './services'

import routes from './routes'
import { ServerError } from './utils/Errors'
import { localeService } from './services/localeservice'

class App {

	public app: express.Application
	private static salt: string = "$2b$05$PD21LwJzPhCGI8XjSPcHzO"
	public ready: Promise<void>
	private _ready: boolean = false

    constructor() {
		this.app = express()
		this.init()
		this.app.use(async (req: Request, res: Response, next:Function) => {
			await this.ready
			next()
		})
		this.config()
		this.app.use(this.printQuery)
		this.app.use('/', routes)
		this.app.use(this.errorHandler)
    }

	public async init(): Promise<void> {
		console.log(chalk.yellow('[app.init]'))
		this._ready = false
		
		this.ready = (async(): Promise<void> => {
			
			await localeService.init()
			await globalSettingsService.init()

			// for testing
			// await objectTypeDefinitionService.reset()

			await objectTypeDefinitionService.init()

			this._ready = true
			console.log(chalk.green('[app.init] READY'))
		})()
		return this.ready
	}

	public isReady(): boolean {
		return this._ready
	}

    private config(): void {
		this.app.disable('x-powered-by')
		this.app.use(express.static('public'))
        this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: true }))
		// allow client delivered by webpack server to access this server
		this.app.use(cors({
			origin: ['http://localhost:8080'], // TODO: centralize configs
			credentials: true
		}))

		mongoose.set('useFindAndModify', false)
		mongoose.set('useCreateIndex', true)
		mongoose.connect('mongodb://127.0.0.1:27017/MYDB', { useNewUrlParser: true })
		let db = mongoose.connection
		// mongoose.set('debug', true)
		db.on('error', err => {
			console.log('err: ', err)
		})
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
		this.app.use(session(sessionParams))
		// hash passwords
		this.app.use(this.hashPassword)
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

	private errorHandler(err: Error | ServerError, req: Request, res: Response, next: NextFunction) {
		if ((<ServerError>err).httpCode) {
			console.log(chalk.red(err.stack), '(0)')
			console.log(err, '(0)')
			res.status((<ServerError>err).httpCode).send(err.message)
		} else {
			console.log(chalk.red(err.stack), '(1)')
			console.log(err, '(1)')
			res.status(SERVER_ERROR).send('Unexpected Error')
		}
	}

	private printQuery(req: Request, res: Response, next: NextFunction) {
		console.log(chalk.keyword('goldenrod')('=================================='))
		console.log(`${req.method} : ${req.url}`)
		new Array('body', 'params', 'query').forEach(x => {
			if (Object.keys(req[x]).length > 0) {
				console.log(`\t${x}: `, req[x])
			}
		})
		next()
	}

}

export default new App();
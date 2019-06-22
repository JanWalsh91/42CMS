import * as React from 'react';

import { CreateUserForm } from './CreateUserForm';
import { LoginForm } from './LoginForm';
import { Button, Props as ButtonProps } from '../components/Button';

import '../styles/Login.scss';

type Mode = 'Create' | 'Login';

export interface Props { };
export interface State {
	mode: Mode,
};

export class Login extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			mode: 'Login'
		};
	}

	toggleMode = (mode: Mode) => {
		console.log('Toggle mode');
		this.setState({mode: mode});
	}

	panelTitle: { [key in Mode] : JSX.Element } = {
		Create: (<h2>Create an Account</h2>),
		Login: (<h2>Login</h2>)
	}

	toggleButtonText: { [key in Mode] : string } = {
		Create: 'Sign in',
		Login: 'Sign up'
	}
	
	onLogin = (res: Response) => {
		console.log('[onLogin]');
		if (res.status == 200) {
			console.log('ok!')
		} else {
			console.log(res.status);
		}
	}

	onCreate = (res: Response) => {
		console.log('[onCreate]');
		if (res.status == 200) {
			console.log('ok!')
		} else {
			console.log(res.status);
		}
	}

	form: { [key in Mode] : JSX.Element } = {
		'Create': (<CreateUserForm onSubmit={(res) => this.onCreate(res)}/>),
		'Login': (<LoginForm onSubmit={(res) => this.onLogin(res)}/>)
	}

	render() {
		
		const toggleButton = (<Button text={this.toggleButtonText[this.state.mode]} handleClick={() => this.toggleMode(this.state.mode == 'Create' ? 'Login' : 'Create')}/>)

		return (
			<div className="Login">
				{this.panelTitle[this.state.mode]}
				{this.form[this.state.mode]}
				{toggleButton}
			</div>
		);
	}
}
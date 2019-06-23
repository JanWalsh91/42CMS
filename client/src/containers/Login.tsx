import * as React from 'react';
import { BrowserRouter as Router, Route, RouteComponentProps, Switch, Redirect } from 'react-router-dom';

import { CreateUserForm } from './CreateUserForm';
import { LoginForm } from './LoginForm';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs/Tabs';
import { Tab } from '../components/Tabs/Tab';

import '../styles/Login.scss';

type Mode = 'SignUp' | 'SignIn';

export interface Props extends RouteComponentProps<{

}>{};
export interface State {
	mode: Mode,
};

export class Login extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			mode: 'SignIn'
		};
	}

	toggleMode = (mode: Mode) => {
		console.log('Toggle mode');
		this.setState({mode: mode});
	}

	panelTitle: { [key in Mode] : JSX.Element } = {
		SignUp: (<h2>Create an Account</h2>),
		SignIn: (<h2>Login</h2>)
	}

	toggleButtonText: { [key in Mode] : string } = {
		SignUp: 'Sign in',
		SignIn: 'Sign up'
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

	render() {
		
		const toggleButton = (<Button text={this.toggleButtonText[this.state.mode]} handleClick={() => this.toggleMode(this.state.mode == 'SignUp' ? 'SignUp' : 'SignIn')}/>)

		return (
			<Router>
				<div className="Login">
					<Tabs activeTabId={this.state.mode}>
						<Tab id='SignIn' to='signin'>Sign in</Tab>
						<Tab id='SignUp' to='signup'>Sign up</Tab>
					</Tabs>
					<Switch>
						<Route path='/signin' component={() => 
							<LoginForm onSubmit={(res) => this.onLogin(res)}/>
						}/>
						<Route path='/signup' render={() =>
							<CreateUserForm onSubmit={(res) => this.onCreate(res)}/>
						}/>
						<Redirect to='signin' />
					</Switch>
					{toggleButton}
				</div>
			</Router>
		);
	}
}
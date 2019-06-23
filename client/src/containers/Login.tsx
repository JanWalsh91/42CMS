import * as React from 'react';
import { BrowserRouter as Router, Route, RouteComponentProps, Switch, Redirect } from 'react-router-dom';

import { CreateUserForm } from './CreateUserForm';
import { LoginForm } from './LoginForm';
import { TabBar } from '../components/TabBar/TabBar';
import UserContext from '../context/user';

import '../styles/Login.scss';

export interface Props extends RouteComponentProps<{}>{};

export interface State {
	activeTabKey: string
};

export class Login extends React.Component<Props, State> {
	
	static contextType = UserContext

	constructor(props: Props) {
		super(props);
		this.state = {
			activeTabKey: 'signin'
		}
		console.log('[Login.constructor]', this.context)
	}

	componentDidMount() {
		console.log('[Login.componentDidMount]', this.context)
	}

	render() {

		let loginForm = null;
		let createUserForm = null;
		if (this.state.activeTabKey == 'signin') {
			loginForm = <LoginForm />
		} else {
			createUserForm = <CreateUserForm />
		}

		return (
			<div className="Login">
				<TabBar
					activeTabKey={this.state.activeTabKey}
					onTabClick={(key: string)=> this.setState({activeTabKey: key})}
					tabs={[{
						tabKey: 'signin',
						title: 'Sign In'
					}, {
						tabKey: 'signup',
						title: 'Sign Up'
					}]}/>
				{loginForm}
				{createUserForm}
			</div>
		);
	}
}

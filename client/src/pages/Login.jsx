import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, RouteComponentProps, Switch, Redirect } from 'react-router-dom';

import { CreateUserForm } from '../containers/CreateUserForm';
import { LoginForm } from '../containers/LoginForm';
import { TabBar } from '../components/TabBar/TabBar';
import UserContext from '../context/user';

import '../styles/Login.scss';


export default (props) =>  {
	
	// const userContext = useContext('user');
	const [activeTabKey, setActivetabKey] = useState('signin');

	useEffect(() => {
		console.log('[Login.userEffect]')
	});

	let loginForm = null;
	let createUserForm = null;
	if (activeTabKey == 'signin') {
		loginForm = <LoginForm />
	} else {
		createUserForm = <CreateUserForm />
	}

	return (
		<div className="Login">
			<div className="Modal">
				<TabBar
					activeTabKey={activeTabKey}
					onTabClick={key => setActivetabKey(key)}
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
		</div>
	);
}

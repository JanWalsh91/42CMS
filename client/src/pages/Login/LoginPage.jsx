import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';

import CreateUserForm from '../../containers/CreateUserForm';
import LoginForm from '../../containers/LoginForm';
import TabBar from '../../components/TabBar/TabBar';


export default () =>  {
	
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

	const StyledLogin = styled.div`
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		.Modal {
			display: flex;
			flex-direction: column;
			// border: grey 1px solid;
			min-height: 250px;
			min-width: 200px;
		}
	`;

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

import React, {useContext } from 'react';

import Form from '../components/Form/Form';
import { UserContext } from '../context/user';

const LoginForm = () => {
	const userContext = useContext(UserContext);

	const formConfig = {
		inputs: {
			username: {
				element: 'input',
				config: {
					type: 'text',
					placeholder: 'Username'
				},
				value: 'jsmith',
				validation: {
					required: true,
					minLength: 3,
					maxLength: 24
				}
			},
			password: {
				element: 'input',
				config: {
					type: 'password',
					placeholder: 'Password'
				},
				value: 'password',
				validation: {
					required: true,
					minLength: 6,
					maxLength: 24,
				}
			},
		},
		submitText: 'Sign In',
		onSubmit: async (formData) => {
			console.log('%c <LoginForm /> onSubmit', 'color: green', formData);
			await userContext.login(formData);
		}
	}

	return <Form {...formConfig}/>;
}

export default LoginForm;
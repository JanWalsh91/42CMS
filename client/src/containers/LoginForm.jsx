import React, { useState, useContext } from 'react';
import update from 'immutability-helper';

import Form from '../components/Form/Form';
import api from '../utils/api';
import { UserContext } from '../context/user';
import useApi from '../hooks/useApi';

const LoginForm = () => {
	const userContext = useContext(UserContext);

	const { loading, data, fetch } = useApi('post', 'login');
	const [loginFormData, setLoginFormData] = useState({
		inputs: {
			name: {
				element: 'input',
				config: {
					type: 'text',
					placeholder: 'Username'
				},
				value: 'myname',
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
				value: 'poipoipoi',
				validation: {
					required: true,
					minLength: 6,
					maxLength: 24,
				}
			},
		},
		submitText: 'Sign In',
		onSubmit: async (formData) => {
			console.log('[LoginForm]', formData);
			fetch('post', '/login', formData);
			// userContext.
		},
		onInputChange: (id, value) => {
			setLoginFormData(update(loginFormData, {
					inputs: {
						[id]: {
							value: {
								$set: value
							}
						}
					}
				})
			);
		}
	});

	return (
		<Form {...loginFormData}/>
	)
}

export default LoginForm;
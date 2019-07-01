import React, { useState } from 'react';
import update from 'immutability-helper';

import Form from '../components/Form/Form';
import api from '../utils/api';

const CreateUserForm = props => {

	const formConfig = {
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
			projectName: {
				element: 'input',
				config: {
					type: 'text',
					placeholder: 'Project Name'
				},
				value: 'projectName',
				validation: {
					required: true
				}
			}
		},
		submitText: 'Sign Up',
		onSubmit: async (formData) => {
			console.log('<CreateUserForm />', formData);
			api.post('/users', formData).then(res => {
				console.log('res', res.data);
				if (props.onSubmit) {
					props.onSubmit(res);
				}
			});
		},
	}

	return (
		<Form {...formConfig}/>
	)
}

export default CreateUserForm;
import React, { useContext } from 'react';

import Form from '../components/Form/Form';
import { UserContext } from '../context/user';

const CreateUserForm = () => {

	const userContext = useContext(UserContext);

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
			console.log('%c <CreateUserForm /> onSubmit', 'color: green', formData);
			await userContext.create(formData);
		},
	}

	return <Form {...formConfig}/>;
}

export default CreateUserForm;
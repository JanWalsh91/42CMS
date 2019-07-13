import React, { useContext } from 'react';

import Form from '../components/Form/Form';
import { UserContext } from '../context/user';

const CreateUserForm = () => {

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
			name: {
				element: 'input',
				config: {
					type: 'text',
					placeholder: 'My Name'
				},
				value: 'John Smith',
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
			projectName: {
				element: 'input',
				config: {
					type: 'text',
					placeholder: 'Project Name'
				},
				value: 'Default Project',
				validation: {
					required: true
				}
			}
		},
		submitText: 'Sign Up',
		onSubmit: async formData => {
			console.log('%c <CreateUserForm /> onSubmit', 'color: green', formData);
			await userContext.create(formData);
		},
	}

	return <Form {...formConfig}/>;
}

export default CreateUserForm;
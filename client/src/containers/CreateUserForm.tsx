import * as React from 'react';
import update from 'immutability-helper';

import { Form, Props as FormProps } from '../components/Form';
import api from '../utils/api';

export interface Props { };

export interface State {
	createUserForm: FormProps
};

export class CreateUserForm extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			createUserForm: {
				inputs: {
					name: {
						element: 'input',
						config: {
							type: 'text',
							placeholder: 'Username'
						},
						value: '',
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
						value: '',
						validation: {
							required: true,
							minLength: 6,
							maxLength: 24
						}
					},
					projectName: {
						element: 'input',
						config: {
							type: 'text',
							placeholder: 'Project Name'
						},
						value: '',
						validation: {
							required: true
						}
					}
				},
				onSubmit: async (formData: any) => {
					console.log('[CreateUserForm]', formData);
					let res: any = await api.post('/users', formData);
					console.log('res', res)
					res = await api.get('/users/5d077422f6497b09da55c047');
					console.log('res2', res)
				},
				onInputChange: (id: any, value: any) => {
					this.setState(prevState => {
						return update(prevState, {
							createUserForm: {
								inputs: {
									[id]: {
										value: {
											$set: value
										}
									}
								}
							} 
						})
					});
					return null
				}
			}
		}
	}

	render() {
		return (
			<Form {...this.state.createUserForm}/>
		)
	}
}
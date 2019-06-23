import * as React from 'react';
import update from 'immutability-helper';

import { Form, Props as FormProps } from '../components/Form';
import api from '../utils/api';

export interface Props { onSubmit?: (res: Response) => any};

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
				onSubmit: async (formData: any) => {
					console.log('[CreateUserForm]', formData);
					api.post('/users', formData).then(res => {
						console.log('res', res.data);
						if (this.props.onSubmit) {
							this.props.onSubmit(res as any);
						}
					});
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
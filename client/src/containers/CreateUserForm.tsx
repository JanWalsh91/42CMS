import * as React from 'react';

import update from 'immutability-helper';

import { Form, Props as FormProps } from '../components/Form';

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
					username: {
						element: 'input',
						config: {
							type: 'text',
							placeholder: 'Username'
						},
						value: '',
						isValid: false
					},
					password: {
						element: 'input',
						config: {
							type: 'password',
							placeholder: 'Password'
						},
						value: '',
						isValid: false
					},
				},
				handleSubmit: (formData: any) => {
					console.log('[CreateUserForm]', formData);
				},
				handleInputChange: (id: any, value: any) => {
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
					console.log('[CreateUserForm]', id, value);
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
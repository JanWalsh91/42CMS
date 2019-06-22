import * as React from 'react';
import update from 'immutability-helper';

import { Form, Props as FormProps } from '../components/Form';
import api from '../utils/api';

export interface Props { onSubmit?: (res: Response) => any};

export interface State {
	loginForm: FormProps
};

export class LoginForm extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			loginForm: {
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
				onSubmit: async (formData: any) => {
					console.log('[LoginForm]', formData);
					let res: any = await api.post('/login', formData);
					console.log('res', res.data)
					if (this.props.onSubmit) {
						this.props.onSubmit(res);
					}
				},
				onInputChange: (id: any, value: any) => {
					this.setState(prevState => {
						return update(prevState, {
							loginForm: {
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
			<Form {...this.state.loginForm}/>
		)
	}
}
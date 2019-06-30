import React, { useState } from 'react';
import update from 'immutability-helper';

import Form from '../components/Form/Form';
import api from '../utils/api';

const CreateUserForm = props => {
	const [createUserFormData, setCreateUserFormData] = useState({
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
			console.log('[CreateUserForm]', formData);
			api.post('/users', formData).then(res => {
				console.log('res', res.data);
				if (props.onSubmit) {
					props.onSubmit(res);
				}
			});
		},
		onInputChange: (id, value) => {
			console.log(`on input change id: ${id} value: ${value}`)
			console.log(`old data:`, createUserFormData.inputs)
			let x = update(createUserFormData, {
					inputs: {
						[id]: {
							value: {
								$set: value
							}
						}
					}
				})
			console.log('new data: ', x.inputs);
			setCreateUserFormData(x)
		}
	});
	console.log(`render with input username value: ${createUserFormData.inputs.name.value}`);
	return (
		<Form {...createUserFormData}/>
	)
}

// class CreateUserForm extends React.Component {
// 	constructor(props){
// 		super(props);
// 		this.state = {
// 			inputs: {
// 				name: {
// 					element: 'input',
// 					config: {
// 						type: 'text',
// 						placeholder: 'Username'
// 					},
// 					value: 'myname',
// 					validation: {
// 						required: true,
// 						minLength: 3,
// 						maxLength: 24
// 					}
// 				},
// 				password: {
// 					element: 'input',
// 					config: {
// 						type: 'password',
// 						placeholder: 'Password'
// 					},
// 					value: 'poipoipoi',
// 					validation: {
// 						required: true,
// 						minLength: 6,
// 						maxLength: 24,
// 					}
// 				},
// 				projectName: {
// 					element: 'input',
// 					config: {
// 						type: 'text',
// 						placeholder: 'Project Name'
// 					},
// 					value: 'projectName',
// 					validation: {
// 						required: true
// 					}
// 				}
// 			},
// 			submitText: 'Sign Up',
// 			onSubmit: async (formData) => {
// 				console.log('[CreateUserForm]', formData);
// 				api.post('/users', formData).then(res => {
// 					console.log('res', res.data);
// 					if (props.onSubmit) {
// 						props.onSubmit(res);
// 					}
// 				});
// 			},
// 			onInputChange: (id, value) => {
// 				console.log(`on input change id: ${id} value: ${value}`)
// 				this.setState(update(this.state, {
// 						inputs: {
// 							[id]: {
// 								value: {
// 									$set: value
// 								}
// 							}
// 						}
// 					})
// 				);
// 			}
// 		};
// 	}
// 	render() {
// 		console.log(`render with input username value: ${this.state.inputs.name.value}`);
// 		return (
// 			<Form {...this.state}/>
// 		)
// 	}
// }


export default CreateUserForm;
import React, { useState } from 'react';
import update from 'immutability-helper';

import Input from '../Input/Input';

import './Form.scss'

// export interface State {
// 	inputs: {[id: string]: {
// 		touched: boolean,
// 		dirty: boolean,
// 		valid: boolean,
// 		error: string
// 	}}
// }

/**
 * Create an instance of Form
 * 
 */

const Form = (props) => {
	const [inputs, setInputs] = useState(() => {
		const inputs = { }
		Object.keys(props.inputs).forEach(id => {
			inputs[id] = {
				touched: false,
				dirty: false,
				value: props.inputs[id].value,
				valid: validateInput(id, props.inputs[id].value),
				error: null
			}
		});
		return inputs;
	})

	function validateInput (id, value) {
		let input = props.inputs[id]
		value = value || input.value
		if (input.validation) {
			if (input.validation.hasOwnProperty('required') && value.trim().length == 0) {
				setInputs(update(inputs, {
					[id]: {
						error: {
							$set: 'Required'
						}
					}
				}));
				return false;
			}
			if (input.validation.hasOwnProperty('minLength') && value.trim().length < input.validation.minLength) {
				return false;
			}
			if (input.validation.hasOwnProperty('maxLength') && value.trim().length > input.validation.maxLength) {
				return false;
			}
			if (input.validation.hasOwnProperty('regex') && !input.validation.regex.test(value)) {
				return false;
			}
		}
		return true
	}

	function onSubmit (event) {
		event.preventDefault();
		let valid = Object.keys(inputs).every(id => inputs[id].valid);
		if (valid) {
			let formData = {};
			Object.keys(inputs).map(key => {
				formData[key] = inputs[key].value;
			});
			props.onSubmit(formData);
		}
		return null;
	};

	function onInputChange (e, id) {
		setInputs(update(inputs, {
			[id]: {
				value: { $set: e.currentTarget.value },
				valid: { $set: validateInput(id, e.currentTarget.value) }
			}
		}))
	}

	function onInputBlur (e, id) {
		setInputs(update(inputs, {
			[id]: { touched: { $set: true } }
		}));
	}

	return (
		<form className="Form" onSubmit={onSubmit}>
		<h4>{props.title}</h4>
			{Object.keys(props.inputs).map(id => (
				<Input
					key={id}
					id={id}
					{...props.inputs[id]}
					{...inputs[id]}
					onChange={e => onInputChange(e, id)}
					onBlur={e => onInputBlur(e, id)}
				/>
			))}
			<Input 
				key='submit'
				id='submit'
				element='input'
				config={{type: 'submit'}}
				value={props.submitText}
			/>
		</form>
	)
}

// export interface Props {
// 	title?: string,
// 	inputs: {[id: string]: {
// 		element: 'input',
// 		config: any,
// 		value: string,
// 		validation?: {
// 			required?: boolean,
// 			minLength?: number,
// 			maxLength?: number,
// 			regex?: RegExp
// 		}
// 	}},
// 	submitText: string,
// 	onSubmit: (formData: any) => any,
// 	onInputChange: (id: string, value: string) => any,
// };


export default Form;
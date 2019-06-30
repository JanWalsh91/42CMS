import React, { Component } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';

import { Input, Props as InputProps } from '../Input/Input';

import './FormStyle'



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

export class Form extends Component {
	constructor(props) {
		super(props);
		this.state = { inputs: {} }
		Object.keys(props.inputs).map(id => {
			this.state.inputs[id] = {
				touched: false,
				dirty: false,
				valid: this.validateInput(id, this.props.inputs[id].value),
				error: null
			}
		});
	}

	validateInput(id, value) {
		// console.log('[Form] validateInput');
		let input = this.props.inputs[id]
		value = value || input.value
		if (input.validation) {
			if (input.validation.hasOwnProperty('required') && value.trim().length == 0) {
				this.setState(prevState => update(prevState, {
					inputs: {
						[id]: {
							error: {
								$set: 'Required'
							}
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

	onSubmit(events) {
		event.preventDefault();
		// console.log('[Form] onSubmit', event);
		
		let valid = Object.keys(this.props.inputs).every(id => this.state.inputs[id].valid);
		if (valid) {
			let formData = {};
			Object.keys(this.props.inputs).map(key => {
				formData[key] = this.props.inputs[key].value;
			});
			this.props.onSubmit(formData);
		}
		return null;
	};

	onInputChange(e, id) {
		// console.log('[Form] onInputChange')
		this.props.onInputChange(id, e.currentTarget.value);
		this.state.inputs[id].valid = this.validateInput(id, e.currentTarget.value);
	}

	onInputBlur(e, id) {
		// console.log('[Form] onInputBlur')
		this.setState(prevState => update(prevState, {
			inputs: {
				[id]: {
					touched: {
						$set: true
					}
				}
			}
		}));
	}

	render() {
		return (
			<form className="Form" onSubmit={this.onSubmit}>
			<h4>{this.props.title}</h4>
				{Object.keys(this.props.inputs).map(id => (
					<Input
						key={id}
						id={id}
						{...this.props.inputs[id]}
						{...this.state.inputs[id]}
						onChange={e => this.onInputChange(e, id)}
						onBlur={e => this.onInputBlur(e, id)}
					/>
				))}
				<Input 
					key='submit'
					id='submit'
					element='input'
					config={{type: 'submit'}}
					value={this.props.submitText}
				/>
			</form>
		)
	}
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

// Form.propTypes = {
// 	title: PropTypes.string,
// 	inputs: PropTypes.object.isRequired, // TODO
// 	submitText: PropTypes.string.isRequired,
// 	onSubmit: PropTypes.func.isRequired,
// 	onInputChange: PropTypes.func.isRequired
// }

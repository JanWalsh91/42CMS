import * as React from 'react';

import { Input, Props as InputProps } from './Input';

import '../styles/Form'

export interface Props {
	inputs: {[id: string]: {
		element: 'input',
		config: any,
		value: string,
		isValid: boolean
	}},
	handleSubmit: (formData: any) => any,
	handleInputChange: (id: string, value: string) => any,
};


export class Form extends React.Component<Props, {}> {
	
	validateInputs = (event: React.FormEvent<HTMLFormElement>): any => {
		event.preventDefault();
		console.log('[Form] validateInputs', event);
		
		let valid = true
		if (valid) {
			let formData: { [id: string]: string } = {};
			Object.keys(this.props.inputs).map(key => {
				formData[key] = this.props.inputs[key].value;
			});
			this.props.handleSubmit(formData);
		}
		return null;
	};

	render() {
		return (
			<form className="Form" onSubmit={this.validateInputs}>
				{Object.keys(this.props.inputs).map(id => (
					<Input
						key={id}
						id={id}
						{...this.props.inputs[id]}
						onchange={(e: any) => this.props.handleInputChange(id, e.target.value)}
					/>
				))}
				<Input 
					key='submit'
					id='submit'
					element='input'
					config={{type: 'submit'}}
					onClick={this.props.handleSubmit}
				/>
			</form>
		)
	}
}
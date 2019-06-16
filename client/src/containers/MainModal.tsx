import * as React from 'react';

import { CreateUserForm } from './CreateUserForm';

import '../styles/MainModal.scss';

type Mode = 'Create' | 'Login';

export interface Props { };
export interface State {
	mode: Mode,
};

export class MainModal extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			mode: 'Create'
		};
	}

	toggleMode = () => {
		console.log('Toggle mode');
		if (this.state.mode == 'Create') {
			this.setState({
				mode: 'Login'
			});
		} else {
			this.setState({
				mode: 'Create'
			});
		}
	}

	render() {

		const panelTitle: { [key in Mode] : string } = {
			'Create': 'Create an Account',
			'Login': 'Login' 
		};

		const buttonTitle: { [key in Mode] : string } = {
			'Create': 'Login',
			'Login': 'Create an Account' 
		};


		return (
			<div className="MainModal">
				<h2>{panelTitle[this.state.mode]}</h2>
				<CreateUserForm />
			</div>
		);
	}
}
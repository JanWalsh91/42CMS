import * as React from 'react';
import { RouteComponentProps } from 'react-router';

export interface Props extends RouteComponentProps<{

}>{};
export interface State {

};

export class Home extends React.Component<Props, State> {
	render() {
		return <h1>HOME</h1>
	}
}
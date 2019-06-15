import * as React from 'react';

import '../styles/Layout.scss';
import { MainModal } from '../containers/MainModal';

export interface Props { };

export class Layout extends React.Component<Props, {}> {
    render() {
        return (
			<div className="Layout">
				<MainModal />
			</div>
		)
    }
}
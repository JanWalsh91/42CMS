import React from 'react';

import './Project.scss';

const Project = props => {
	return (
		<div className='Project'>
			<h3 className='ProjectTitle'>
				{props.name}
			</h3>
		</div>
	)
}

export default Project;
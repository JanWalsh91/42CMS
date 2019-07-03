import React from 'react';

import './Tile.scss';

const Tile = props => {
	return <div className="Tile">
		<div className="Header">
			<h3 className="Title">{props.title}</h3>
		</div>
		<div className="MainContent">
			{props.children}
		</div>
	</div>
}

export default Tile;
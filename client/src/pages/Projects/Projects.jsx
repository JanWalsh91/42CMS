import React from 'react';

import Tile from '../../components/Tile/Tile';
import Project from './Project/Project';

import './Projects.scss';

const dummyData = [
	{
		name: 'My project'
	},
	{
		name: 'My second project'
	}
];

const Projects = () => {
	const projects = dummyData.map(project => <Project key={project.name} {...project} />);
	return <div className="Projects">
		<Tile title='My Projects'>
			{projects}
		</Tile>
	</div>
}

export default Projects;
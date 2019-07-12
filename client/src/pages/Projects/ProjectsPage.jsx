import React, { userState } from 'react';
import styled from 'styled-components';

import Projects from './Projects/Projects';
import useApi from '../../hooks/useApi';

const dummyProjects = [
	{name: 'Givenchy', owner: 'Me', id: '0'},
	{name: 'Dior', owner: 'Tom', id: '1'}
];

const ProjectsPage = props => {

	const { fetch } = useApi('get', 'projects');

	return (
		<Projects projects={dummyProjects}/>
	);
};

export default ProjectsPage;
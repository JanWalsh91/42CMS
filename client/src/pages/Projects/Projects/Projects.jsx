import React from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components';

import Project from './ProjectTile';

const ProjectsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-width: 300px;
`;

const Projects = props => {
	const projects = props.projects.map(project => <Project key={project._id} {...project}/>);
	return (
		<ProjectsWrapper>
			{projects}
		</ProjectsWrapper>
	);
};

Projects.propTypes = {
	projects: PropTypes.arrayOf(PropTypes.shape(Project.propTypes)),
};

export default Projects;
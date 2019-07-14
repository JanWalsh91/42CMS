import React from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components';

import ProjectTile from './ProjectTile';
import NewProjectTile from './NewProjectTile';

const ProjectsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-width: 300px;
`;

const Projects = props => {
	const projects = props.projects.map(project => <ProjectTile key={project.id} {...project}/>)
	projects.push(<NewProjectTile key='new' addProject={props.addProject}/>)
	console.log(projects)
	return (
		<ProjectsWrapper>
			{projects}
		</ProjectsWrapper>
	);
};

Projects.propTypes = {
	projects: PropTypes.arrayOf(PropTypes.shape(ProjectTile.propTypes)),
	addProject: PropTypes.func.isRequired
};

export default Projects;
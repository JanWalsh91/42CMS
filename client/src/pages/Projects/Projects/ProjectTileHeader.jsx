import React from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

import IconButton from '../../../components/IconButton/IconButton';

const ProjectTileHeaderWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border: ${props => `${props.theme.thick} ${props.theme.primaryColor} solid`};
	cursor: pointer;
	&:hover {
		border-color: ${props => props.theme.hoverColor};			
		color: ${props => props.theme.hoverColor};			
	}
`;

const ProjectName = styled.h4`
	margin: 0;
	width: 30%;
	text-align: center;
`;

const StyledIconButton = styled(IconButton)`
	border-left: ${props => `${props.theme.thin} ${props.theme.primaryColor} solid`}; 
`;

const ProjectTileHeader = props => (
	<ProjectTileHeaderWrapper onClick={props.onClick}>
		<ProjectName>{props.name}</ProjectName>
		<StyledIconButton
			onClick={props.onToggle}
			icon={faEllipsisV}
		/>
	</ProjectTileHeaderWrapper>
);

ProjectTileHeader.propTypes = {
	name: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	onToggle: PropTypes.func.isRequired
};

export default ProjectTileHeader;
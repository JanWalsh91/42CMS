import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'


import ProjectTileHeader from './ProjectTileHeader'

const ProjectWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin: 5px;
	/* border: ${props => `${props.theme.thick} ${props.theme.primaryColor} solid`}; */
	min-width: 300px;

	border: red 1px dashed;
`


const ProjectDetails = styled.div`
	height: 200px;
`

const Project = props => {

	const [open, setOpen] = useState(false)

	const toggleDetails = e => {
		e.stopPropagation()
		setOpen(!open)
	}

	const goToProjectPage = () => {
		console.log('goToProjectPage')
	}

	return (
		<ProjectWrapper>
			<ProjectTileHeader
				name={props.name}
				onToggle={toggleDetails}
				onClick={goToProjectPage}
			/>
			<ProjectDetails hidden={!open}>
				DETAILS
			</ProjectDetails>
		</ProjectWrapper>	
	)
}

const propTypes = {
	name: PropTypes.string,
	owner: PropTypes.string,
	id: PropTypes.string,
}

Project.propTypes = propTypes

export default Project
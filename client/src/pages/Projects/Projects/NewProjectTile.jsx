import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import ProjectTileHeader from './ProjectTileHeader'
import CreateProjectForm from '../../../containers/CreateProjectForm'

const NewProjectTileWrapper = styled.div`
	min-width: 300px;
	min-height: 40px;
	/* DEBUG */
	border: red dashed 1px;
`

const NewProjectTile = props => {
	const [open, setOpen] = useState(false)

	const toggle = e => {
		e.preventDefault()
		setOpen(!open)
	}

	let form = open ? <CreateProjectForm onSubmit={props.addProject}/> : null;

	return (
		<NewProjectTileWrapper>
			<ProjectTileHeader 
				name="New"
				onClick={toggle}
				onToggle={toggle}
			/>
			{form}
		</NewProjectTileWrapper>
	)
}

NewProjectTile.propTypes = {
	addProject: PropTypes.func.isRequired,
}

export default NewProjectTile
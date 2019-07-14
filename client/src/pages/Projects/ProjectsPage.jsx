import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components'
import chalk from 'chalk'

import useApi from '../../hooks/useApi'
import { UserContext } from '../../context/userContext'
import Projects from './Projects/Projects'
import NavBar from '../../components/NavBar/NavBar'
import Button from '../../components/Button/Button'


const ProjectsPage = props => {

	const [ projects, setProjects ] = useState([])
	const getProjects = useApi('get', 'projects')
	const userContext = useContext(UserContext)

	useEffect(() => {
		let isSubscribed = true
		const fetchData = async () => {
			console.log(chalk.red('Fetching data'))
			try {
				const ret = await getProjects({})
				if (isSubscribed) {
					setProjects(ret.projects)
				}
			} catch (e) {
				console.log('ERROR')
			}
		}
		fetchData()
		return () => isSubscribed = false
	}, [])

	return (
		<>
			<div>Projects</div>
			<NavBar>
				<Button onClick={userContext.logout}>Logout</Button>
			</NavBar>
			<Projects projects={projects}/>	
		</>
	);
};

export default ProjectsPage
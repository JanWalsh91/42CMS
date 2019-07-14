import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import Projects from './Projects/Projects'
import useApi from '../../hooks/useApi'
import chalk from 'chalk'

const dummyProjects = [
	{name: 'Givenchy', owner: 'Me', id: '0'},
	{name: 'Dior', owner: 'Tom', id: '1'}
]

const ProjectsPage = props => {

	const [ projects, setProjects ] = useState([])
	const getProjects = useApi('get', 'projects')

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
			<Projects projects={projects}/>	
		</>
	);
};

export default ProjectsPage
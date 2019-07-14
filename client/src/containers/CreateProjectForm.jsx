import React from 'react'
import PropTypes from 'prop-types'

import Form from '../components/Form/Form'
import useApi from '../hooks/useApi';

const CreateProjectForm = props => {

	const createProject = useApi('post', 'projects')

	const formConfig = {
		inputs: {
			name: {
				element: 'input',
				config: {
					type: 'text',
					placeholder: 'Project Name'
				},
				value: 'Name',
				validation: {
					required: true,
					minLength: 3,
					maxLength: 24
				}
			},
		},
		submitText: 'Create',
		onSubmit: async(formData) => {
			console.log('%c[CreateProjectForm.onSubmit]', 'color: magenta', formData)
			try {
				let ret = await createProject({body: formData});
				console.log('%c[CreateProjectForm.onSubmit] SUCCESS', 'color: green', formData)
				props.onSubmit(ret)
			} catch (e) {
				console.log('%c[CreateProjectForm.onSubmit] FAIL', 'color: red', formData)	
			}
		}
	}

	return <Form {...formConfig}/>
}

CreateProjectForm.propTypes = {
	onSubmit: PropTypes.func
}

export default CreateProjectForm
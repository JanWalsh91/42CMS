import React from 'react'
import PropTypes from 'prop-types'

import Form from '../components/Form/Form'

const CreateProjectForm = props => {

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
		onSubmit: async (formData) => {
			console.log('%c <CreateProject /> onSubmit', 'color: green', formData)
			
			props.onSubmit({
				name: 'new project',
				id: 'lala',
				owner: 'Jan'
			})
		}
	}

	return <Form {...formConfig}/>
}

CreateProjectForm.propTypes = {
	onSubmit: PropTypes.func
}

export default CreateProjectForm
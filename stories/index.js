import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import theme from '../client/src/context/theme';

import Button from '../client/src/components/Button/Button.jsx';
import Tile from '../client/src/components/Tile/Tile';
import Checkbox from '../client/src/components/Checkbox/Checkbox';
import Select from '../client/src/components/Select/Select';

import Projects from '../client/src/pages/Projects/Projects/Projects';
import ProjectsPage from '../client/src/pages/Projects/ProjectsPage';

// storiesOf('Basic/Button', module)
// 	.add('With Text', () => (
// 		<Button>Click Me</Button>
// 	));
		
// storiesOf('Components/Button', module)
// .addDecorator(storyFn => (
// 	<ThemeProvider theme={theme}>
// 		{storyFn()}
// 	</ThemeProvider>
// ))
// .add('With Text', () => (
// 	<Button>Click Me</Button>
// ))
// .add('Disabled', () => (
// 	<Button disabled>Click Me</Button>
// 	))
// .add('With Text', () => (
// 	<Button>Click Me</Button>
// ));


// storiesOf('Components/Tile', module)
// .addDecorator(storyFn => (
// 	<ThemeProvider theme={theme}>
// 		{storyFn()}
// 	</ThemeProvider>
// ))
// .add('With Text', () => (
// 	<Tile>This is the tile contents</Tile>
// ));

storiesOf('Components/Checkbox', module)
.addDecorator(storyFn => (
	<ThemeProvider theme={theme}>
		{storyFn()}
	</ThemeProvider>
))
.add('Inactive', () => (
	<Checkbox />
))
.add('Active', () => (
	<Checkbox active/>
))
.add('With label', () => (
	<Checkbox active label='Use this State'/>
))

// const SelectWrapper = props => {
// 	const [value, setValue] = useState(props.defaultValue);

// 	const onChange = e => setValue(e.target.value);

// 	return (
// 		<Select 
// 			value={value}
// 			onChange={onChange}
// 			options={props.options}/>
// 	);
// };

// storiesOf('Components/Select', module)
// .addDecorator(storyFn => (
// 	<ThemeProvider theme={theme}>
// 		{storyFn()}
// 	</ThemeProvider>
// ))
// .add('Inactive', () => (
// 	<SelectWrapper
// 		defaultValue='default'
// 		options={[
// 			{ value: 'default', label: 'default' },
// 			{ value: 'option1', label: 'option1' },
// 		]}
// 		/>
// ))

storiesOf('Pages/Projects', module)
.addDecorator(storyFn => (
	<ThemeProvider theme={theme}>
		{storyFn()}
	</ThemeProvider>
))
.add('Page', () => (
	<ProjectsPage />
));

storiesOf('Pages/Projects/Components', module)
.addDecorator(storyFn => (
	<ThemeProvider theme={theme}>
		{storyFn()}
	</ThemeProvider>
))
.add('Projects', () => (
	<Projects projects={[
		{name: 'Givenchy', owner: 'Me', id: '0'},
		{name: 'Dior', owner: 'Tom', id: '1'}
	]}/>
));

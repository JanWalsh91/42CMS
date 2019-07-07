import React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '../client/src/components/Button/Button.jsx';
import { ThemeProvider } from 'styled-components';
import theme from '../client/src/context/theme';

storiesOf('Basic/Button', module)
	.add('With Text', () => (
		<Button>Hello</Button>
	))
	.add('With Theme', () => (
		<ThemeProvider theme={theme}>
			<Button>Hello</Button>
		</ThemeProvider>
	))

import { mount } from 'svelte';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/manrope';
import './styles/tokens.css';
import './styles/global.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });

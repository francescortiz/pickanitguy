import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { bootstrapAppSupabase } from './app-supabase';

const { appSupabase } = bootstrapAppSupabase();

const app = mount(App, {
	target: document.getElementById('app')!,
	props: {
		appSupabase,
	},
});

export default app;

import { createSignal } from "solid-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import logo from "./assets/Pick an IT Guy.webp";
import styles from "./App.module.css";

export const Auth = ({ supabase }: { supabase: SupabaseClient<Database> }) => {
	const [loading, setLoading] = createSignal(false);
	const [email, setEmail] = createSignal("");

	const handleLogin = async (e: SubmitEvent) => {
		e.preventDefault();

		try {
			const { protocol, host, port } = location;
			const portFragment = ["http80", "https443"].includes(location.protocol + location.port)
				? ""
				: location.port
					? `:${location.port}`
					: "";
			const redirectUrl = `${protocol}://${host}${portFragment}/?authorized=true`;
			setLoading(true);
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: redirectUrl,
				},
			});
			if (error) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<img src={logo} class={styles.logo} alt="Pick an IT Guy" />
			<p>Pick an IT Guy</p>

			<div class="row flex-center flex">
				<div class="col-6 form-widget" aria-live="polite">
					<p class="description">Sign in with Google with the button below</p>
					<form class="form-widget" onSubmit={handleLogin}>
						<div>
							<button type="submit" class="button block" aria-live="polite">
								{loading() ? <span>Loading</span> : <span>Login with Google</span>}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

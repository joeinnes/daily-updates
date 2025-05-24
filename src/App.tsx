import { AuthButton } from "@/AuthButton.tsx";
import { AddUpdate } from "@/components/AddUpdate.tsx";
import { UpdateList } from "@/components/UpdateList.tsx";
import { useIsAuthenticated } from "jazz-react";

function App() {
	const isAuthenticated = useIsAuthenticated();
	const savedTheme = localStorage.getItem("theme");
	const systemPrefersDark = window.matchMedia(
		"(prefers-color-scheme: dark)",
	).matches;

	if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}

	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", (e) => {
			// Only auto-switch if user hasn't set a manual preference
			if (!localStorage.getItem("theme")) {
				if (e.matches) {
					document.documentElement.classList.add("dark");
				} else {
					document.documentElement.classList.remove("dark");
				}
			}
		});

	return (
		<>
			<header>
				<nav className="mx-auto max-w-4xl flex justify-between items-center p-3">
					<div className="bg-primary text-primary-foreground size-11 font-bold rounded-lg text-3xl grid place-items-center">
						S
					</div>
					<div className="flex gap-2 items-center">
						{!isAuthenticated && (
							<span className="hidden md:flex">
								Authenticate to share the data with another device.
							</span>
						)}{" "}
						<AuthButton />
					</div>
				</nav>
			</header>
			<main className="mx-auto max-w-4xl mt-16 flex flex-col gap-8 p-3">
				<AddUpdate />
				<UpdateList />
			</main>
		</>
	);
}

export default App;

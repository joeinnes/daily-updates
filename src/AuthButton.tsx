"use client";

import { Button } from "@/components/ui/button";
import { useAccount, usePasskeyAuth } from "jazz-react";
import { APPLICATION_NAME } from "./main";

export function AuthButton() {
	const { logOut } = useAccount();

	const auth = usePasskeyAuth({
		appName: APPLICATION_NAME,
	});

	function handleLogOut() {
		logOut();
		window.history.pushState({}, "", "/");
	}

	if (auth.state === "signedIn") {
		return <Button onClick={handleLogOut}>Log out</Button>;
	}

	return (
		<div className="flex gap-2">
			<Button onClick={() => auth.signUp("")}>Sign up</Button>
			<Button onClick={() => auth.logIn()}>Log in</Button>
		</div>
	);
}

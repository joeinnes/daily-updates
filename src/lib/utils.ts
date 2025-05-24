import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function contrastColor(color: string) {
	let r, g, b;

	if (typeof color !== "string") return "black";

	color = color.trim();

	if (color.startsWith("#")) {
		color = color.slice(1);

		if (color.length === 3) {
			color = color
				.split("")
				.map((c) => c + c)
				.join("");
		}

		if (color.length === 6) {
			r = Number.parseInt(color.slice(0, 2), 16);
			g = Number.parseInt(color.slice(2, 4), 16);
			b = Number.parseInt(color.slice(4, 6), 16);
		} else {
			return "black";
		}
	} else if (color.startsWith("rgb")) {
		const matches = color.match(/rgba?\(([^)]+)\)/);
		if (matches) {
			const [rStr, gStr, bStr] = matches[1]
				.split(",")
				.map((v) => Number.parseInt(v.trim(), 10));
			r = rStr;
			g = gStr;
			b = bStr;
		} else {
			return "black";
		}
	} else {
		return "black";
	}

	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? "black" : "white";
}

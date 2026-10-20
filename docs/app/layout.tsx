import { RootProvider } from "fumadocs-ui/provider";
import "fumadocs-ui/style.css";
import type { ReactNode } from "react";

export const metadata = {
	title: {
		template: "%s | Free Reels AI",
		default: "Free Reels AI — Short-form video studio",
	},
	description:
		"Open-source studio for creating short-form videos with local, stock, and hosted AI providers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Dev helper: expose wishlistService on window for quick testing
if (import.meta.env.DEV) {
	import('./services/wishlist.service').then((m) => {
		// @ts-ignore
		window.__WISHLIST = m.wishlistService;
	}).catch((e) => console.warn('Failed to load wishlist dev helper:', e));
}

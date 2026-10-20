// Keep these variables local to this script.
(() => {
	// Find the page's "back to experiments" link.
	const backLink = document.querySelector("[data-experiments-back-link]");

	// Check whether the visitor came from the real experiments menu.
	if (new URLSearchParams(window.location.search).get("from") === "real-menu" && backLink) {
		// Send them back to that menu.
		backLink.href = "../real_menu/experiments_real_menu.html";
	}
})();

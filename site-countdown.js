(() => {
	// One fixed UTC deadline keeps every visitor on the same countdown.
	const deadline = Date.parse("2026-10-31T12:00:00Z");
	// Error pages should not receive fake errors or text glitches.
	const isErrorPage = decodeURIComponent(window.location.pathname).includes("/errors pages/");

	// Resolve these paths from this script so they work on pages in nested folders.
	const shutdownPage = new URL("errors pages/site_down.html", document.currentScript.src);
	const fakeErrorPage = new URL("errors pages/Fake_error.html", document.currentScript.src);
	const errorChance = 0.12;
	let countdownTimer;
	// This flag prevents the same page load from corrupting text more than once.
	let pageTextDistorted = false;

	function distortPageText() {
		// sessionStorage keeps a separate reload counter for this page in this tab.
		const variantKey = `foundation-5924-text-variant:${window.location.pathname}`;
		let variant = Math.floor(Math.random() * 1000);

		try {
			variant = Number(window.sessionStorage.getItem(variantKey) || 0) + 1;
			window.sessionStorage.setItem(variantKey, String(variant));
		} catch {
			// Random variants still work when session storage is unavailable.
		}

		// These symbols replace letters to create the corrupted-text effect.
		const glyphs = ["█", "▓", "▒", "░", "▧"];
		// Keep scripts, form controls, hidden content, and the live countdown unchanged.
		const excludedElements = "script, style, noscript, textarea, input, select, option, [aria-hidden='true'], #countdown";
		// A TreeWalker visits text nodes without changing the page's HTML structure.
		const walker = document.createTreeWalker(document.body, window.NodeFilter.SHOW_TEXT);
		let textNode;
		let nodeIndex = 0;

		while ((textNode = walker.nextNode())) {
			if (!textNode.parentElement || textNode.parentElement.closest(excludedElements)) {
				continue;
			}

			// Find letters in this text node so punctuation and spaces stay as they are.
			const letterMatches = [...textNode.data.matchAll(/[A-Za-z]/g)];
			if (letterMatches.length === 0) {
				continue;
			}

			// The reload counter and node position choose which letter and symbol to change.
			const variantOffset = variant + nodeIndex;
			const target = letterMatches[variantOffset % letterMatches.length];
			const characters = [...textNode.data];
			characters[target.index] = glyphs[variantOffset % glyphs.length];
			textNode.data = characters.join("");
			nodeIndex += 1;
		}
	}

	function maybeShowFakeError() {
		// Never send someone from an error page to another fake error page.
		if (isErrorPage) {
			return;
		}

		// Each page has its own retry state for the current browser tab.
		const attemptKey = `foundation-5924-page-retry:${window.location.pathname}`;

		try {
			const attemptState = window.sessionStorage.getItem(attemptKey);

			if (attemptState === "retry") {
				// The visitor returned from the fake error, so let this attempt succeed.
				window.sessionStorage.setItem(attemptKey, "done");
				return;
			}

			if (attemptState === "done") {
				return;
			}

			// Save the retry state before redirecting, so Back allows the next visit through.
			if (Math.random() < errorChance) {
				window.sessionStorage.setItem(attemptKey, "retry");
				window.location.replace(fakeErrorPage.href);
				return;
			}

			// Mark this page as checked so the random chance is not rolled every second.
			window.sessionStorage.setItem(attemptKey, "done");
		} catch {
			// Storage may be unavailable; keep the page usable without the one-time error.
		}
	}

	function updateCountdown() {
		// Calculate remaining whole seconds from the shared deadline.
		const secondsRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
		const countdownOutput = document.getElementById("countdown");
		// Corrupt text once per page load, but only during the final ten days.
		if (!isErrorPage && secondsRemaining < 10 * 24 * 60 * 60 && !pageTextDistorted && document.body) {
			distortPageText();
			pageTextDistorted = true;
		}

		if (!isErrorPage) {
			// These levels match the visual effects defined in main.css.
			const damageLevel = secondsRemaining <= 10 * 60 ? 5
				: secondsRemaining <= 60 * 60 ? 4
					: secondsRemaining <= 24 * 60 * 60 ? 3
						: secondsRemaining <= 3 * 24 * 60 * 60 ? 2
							: secondsRemaining <= 7 * 24 * 60 * 60 ? 1
								: 0;
			document.documentElement.dataset.countdownDamage = String(damageLevel);
		}

		if (countdownOutput) {
			// Split seconds into days, hours, minutes, and seconds for display.
            const days = Math.floor(secondsRemaining / 86400);
			const hours = Math.floor((secondsRemaining % 86400) / 3600);
			const minutes = Math.floor((secondsRemaining % 3600) / 60);
			const seconds = secondsRemaining % 60;
			countdownOutput.textContent = `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}

		if (secondsRemaining === 0) {
			// Stop checking and redirect once the shared deadline has passed.
			window.clearInterval(countdownTimer);
			window.location.replace(shutdownPage.href);
			return;
		}

		maybeShowFakeError();
	}

	// Update every second, then update again after the page content has loaded.
	countdownTimer = window.setInterval(updateCountdown, 1000);
	document.addEventListener("DOMContentLoaded", updateCountdown, { once: true });
	updateCountdown();
})();
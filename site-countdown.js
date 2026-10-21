(() => {
	// Use the same UTC end time for every visitor.
	const deadline = Date.parse("2026-10-31T12:00:00Z");
	// Don't add effects or fake errors to error pages.
	const isErrorPage = decodeURIComponent(window.location.pathname).includes("/errors pages/");

	// Build these links from this script's location, even on pages in subfolders.
	const shutdownPage = new URL("errors pages/site_down.html", document.currentScript.src);
	const fakeErrorPage = new URL("errors pages/Fake_error.html", document.currentScript.src);
	const errorChance = 0.10;
	let countdownTimer;
	// Change the page text only once each time the page loads.
	let pageTextDistorted = false;

	function distortPageText() {
		// Track reloads separately for each page in this browser tab.
		const variantKey = `foundation-5924-text-variant:${window.location.pathname}`;
		let variant = Math.floor(Math.random() * 1000);

		try {
			variant = Number(window.sessionStorage.getItem(variantKey) || 0) + 1;
			window.sessionStorage.setItem(variantKey, String(variant));
		} catch {
			// Use a random variation if the browser can't save this count.
		}

		// Mix block symbols and glitch marks into the text.
		const glyphs = ["█", "▓", "▒", "░", "▧"];
		const glitchMarks = ["\u0336", "\u0338", "\u035F"];
		// Leave scripts, form fields, hidden content, invisible text, and the countdown alone.
		const excludedElements = "script, style, noscript, textarea, input, select, option, [aria-hidden='true'], .invisible, #countdown, [aria-live]";
		// Collect text nodes first so the new styled spans aren't processed again.
		const walker = document.createTreeWalker(document.body, window.NodeFilter.SHOW_TEXT);
		const textNodes = [];
		let textNode;
		let nodeIndex = 0;

		while ((textNode = walker.nextNode())) {
			textNodes.push(textNode);
		}

		for (const textNode of textNodes) {
			if (!textNode.parentElement || textNode.parentElement.closest(excludedElements)) {
				continue;
			}

			// Add glitches to some letters, while leaving spaces and punctuation alone.
			const letterMatches = [...textNode.data.matchAll(/[A-Za-z]/g)];
			if (letterMatches.length === 0) {
				continue;
			}

			const targetIndex = (variant + nodeIndex) % letterMatches.length;
			let changedText = "";
			let lastIndex = 0;
			for (const [letterIndex, letterMatch] of letterMatches.entries()) {
				changedText += textNode.data.slice(lastIndex, letterMatch.index);
				const shouldGlitch = letterIndex === targetIndex || Math.random() < 0.25;
				if (shouldGlitch && Math.random() < 0.65) {
					changedText += glyphs[Math.floor(Math.random() * glyphs.length)];
				} else if (shouldGlitch) {
					changedText += letterMatch[0] + glitchMarks[Math.floor(Math.random() * glitchMarks.length)];
				} else {
					changedText += letterMatch[0];
				}
				lastIndex = letterMatch.index + letterMatch[0].length;
			}
			changedText += textNode.data.slice(lastIndex);

			const styledText = document.createElement("span");
			styledText.textContent = changedText;
			if (Math.random() < 0.5) {
				styledText.style.fontWeight = "bold";
			} else {
				styledText.style.fontStyle = "italic";
			}
			if (Math.random() < 0.5) {
				styledText.style.textShadow = "1px 0 #ff3b3b, -1px 0 #41e8ff";
			}
			textNode.replaceWith(styledText);
			nodeIndex += 1;
		}
	}

	function maybeShowFakeError() {
		// Don't show a fake error while already on an error page.
		if (isErrorPage) {
			return;
		}

		// Track whether this page has already tried showing a fake error.
		const attemptKey = `foundation-5924-page-retry:${window.location.pathname}`;

		try {
			const attemptState = window.sessionStorage.getItem(attemptKey);

			if (attemptState === "retry") {
				// They came back from the fake error, so let them continue this time.
				window.sessionStorage.setItem(attemptKey, "done");
				return;
			}

			if (attemptState === "done") {
				return;
			}

			// Save this state before redirecting so returning lets the page load.
			if (Math.random() < errorChance) {
				window.sessionStorage.setItem(attemptKey, "retry");
				window.location.replace(fakeErrorPage.href);
				return;
			}

			// Don't roll the chance again on every countdown update.
			window.sessionStorage.setItem(attemptKey, "done");
		} catch {
			// If storage is unavailable, keep the page working without the fake error.
		}
	}

	function updateCountdown() {
		// Count down to the shared end time, in whole seconds.
		const secondsRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
		const countdownOutput = document.getElementById("countdown");
		// Start changing the text once, during the last ten days.
		if (!isErrorPage && secondsRemaining < 10 * 24 * 60 * 60 && !pageTextDistorted && document.body) {
			distortPageText();
			pageTextDistorted = true;
		}

		if (!isErrorPage) {
			// Set the visual effect level used by main.css.
			const damageLevel = secondsRemaining <= 10 * 60 ? 5
				: secondsRemaining <= 60 * 60 ? 4
					: secondsRemaining <= 24 * 60 * 60 ? 3
						: secondsRemaining <= 3 * 24 * 60 * 60 ? 2
							: secondsRemaining <= 7 * 24 * 60 * 60 ? 1
								: 0;
			document.documentElement.dataset.countdownDamage = String(damageLevel);
		}

		if (countdownOutput) {
			// Show the remaining time as days:hours:minutes:seconds.
            const days = Math.floor(secondsRemaining / 86400);
			const hours = Math.floor((secondsRemaining % 86400) / 3600);
			const minutes = Math.floor((secondsRemaining % 3600) / 60);
			const seconds = secondsRemaining % 60;
			countdownOutput.textContent = `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}

		if (secondsRemaining === 0) {
			// Stop the timer and open the shutdown page when time runs out.
			window.clearInterval(countdownTimer);
			window.location.replace(shutdownPage.href);
			return;
		}

		maybeShowFakeError();
	}

	// Update once a second, when the page loads, and immediately now.
	countdownTimer = window.setInterval(updateCountdown, 1000);
	document.addEventListener("DOMContentLoaded", updateCountdown, { once: true });
	updateCountdown();
})();
(() => {
	const deadline = Date.parse("2026-10-31T12:00:00Z");
	const isErrorPage = decodeURIComponent(window.location.pathname).includes("/errors pages/");

	const shutdownPage = new URL("errors pages/site_down.html", document.currentScript.src);
	const fakeErrorPage = new URL("errors pages/Fake_error.html", document.currentScript.src);
	const errorChance = 0.12;
	let countdownTimer;

	function maybeShowFakeError() {
		if (isErrorPage) {
			return;
		}

		const attemptKey = `foundation-5924-page-retry:${window.location.pathname}`;

		try {
			const attemptState = window.sessionStorage.getItem(attemptKey);

			if (attemptState === "retry") {
				window.sessionStorage.setItem(attemptKey, "done");
				return;
			}

			if (attemptState === "done") {
				return;
			}

			if (Math.random() < errorChance) {
				window.sessionStorage.setItem(attemptKey, "retry");
				window.location.replace(fakeErrorPage.href);
				return;
			}

			window.sessionStorage.setItem(attemptKey, "done");
		} catch {
			// Storage may be unavailable; keep the page usable without the one-time error.
		}
	}

	function updateCountdown() {
		const secondsRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
		const countdownOutput = document.getElementById("countdown");
		if (!isErrorPage) {
			const damageLevel = secondsRemaining <= 10 * 60 ? 5
				: secondsRemaining <= 60 * 60 ? 4
					: secondsRemaining <= 24 * 60 * 60 ? 3
						: secondsRemaining <= 3 * 24 * 60 * 60 ? 2
							: secondsRemaining <= 7 * 24 * 60 * 60 ? 1
								: 0;
			document.documentElement.dataset.countdownDamage = String(damageLevel);
		}

		if (countdownOutput) {
            const days = Math.floor(secondsRemaining / 86400);
			const hours = Math.floor((secondsRemaining % 86400) / 3600);
			const minutes = Math.floor((secondsRemaining % 3600) / 60);
			const seconds = secondsRemaining % 60;
			countdownOutput.textContent = `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}

		if (secondsRemaining === 0) {
			window.clearInterval(countdownTimer);
			window.location.replace(shutdownPage.href);
			return;
		}

		maybeShowFakeError();
	}

	countdownTimer = window.setInterval(updateCountdown, 1000);
	document.addEventListener("DOMContentLoaded", updateCountdown, { once: true });
	updateCountdown();
})();
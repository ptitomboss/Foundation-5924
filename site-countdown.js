(() => {
	const deadline = Date.parse("2026-10-31T12:00:00Z");

	const shutdownPage = new URL("errors pages/site_down.html", document.currentScript.src);
	let countdownTimer;

	function updateCountdown() {
		const secondsRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
		const countdownOutput = document.getElementById("countdown");

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
		}
	}

	countdownTimer = window.setInterval(updateCountdown, 1000);
	document.addEventListener("DOMContentLoaded", updateCountdown, { once: true });
	updateCountdown();
})();
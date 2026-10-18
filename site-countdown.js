(() => {
	const durationMilliseconds = (60 * 60 * 528) * 1000;
	const deadlineKey = "foundation-5924-site-deadline";
	let deadline = Number(window.localStorage.getItem(deadlineKey));

	if (!Number.isFinite(deadline) || deadline <= 0) {
		deadline = Date.now() + durationMilliseconds;
		window.localStorage.setItem(deadlineKey, String(deadline));
	}

	const shutdownPage = new URL("errors pages/site_down.html", document.currentScript.src);
	let countdownTimer;

	function updateCountdown() {
		const secondsRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
		const countdownOutput = document.getElementById("countdown");

		if (countdownOutput) {
			const hours = Math.floor(secondsRemaining / 3600);
			const minutes = Math.floor((secondsRemaining % 3600) / 60);
			const seconds = secondsRemaining % 60;
			countdownOutput.textContent = [hours, minutes, seconds]
				.map((value) => String(value).padStart(2, "0"))
				.join(":");
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
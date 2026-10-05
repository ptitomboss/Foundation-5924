document.addEventListener("DOMContentLoaded", () => {
	const minimumDelay = 60 * 1000;
	const maximumDelay = 3 * 60 * 60 * 1000;
	const messages = Array.isArray(window.randomMessages)
		? window.randomMessages.filter((message) => typeof message === "string" && message.trim())
			.map((message) => message.trim())
		: [];

	if (messages.length === 0) {
		return;
	}

	const notification = document.createElement("div");
	notification.className = "message-notification";
	notification.setAttribute("role", "status");
	notification.setAttribute("aria-live", "polite");
	notification.hidden = true;

	const messageOutput = document.createElement("p");
	messageOutput.className = "message-notification__text";

	const dismissButton = document.createElement("button");
	dismissButton.className = "message-notification__dismiss";
	dismissButton.type = "button";
	dismissButton.setAttribute("aria-label", "Dismiss notification");
	dismissButton.textContent = "×";

	notification.append(messageOutput, dismissButton);
	document.body.append(notification);

	let dismissTimeout;
	dismissButton.addEventListener("click", () => {
		notification.hidden = true;
		window.clearTimeout(dismissTimeout);
	});

	let previousMessage = "";

	function showRandomMessage() {
		const availableMessages = messages.length > 1
			? messages.filter((message) => message !== previousMessage)
			: messages;
		const message = availableMessages[Math.floor(Math.random() * availableMessages.length)];

		messageOutput.textContent = message;
		notification.hidden = false;
		previousMessage = message;
		window.clearTimeout(dismissTimeout);
		dismissTimeout = window.setTimeout(() => {
			notification.hidden = true;
		}, 10 * 1000);

		const delay = minimumDelay + Math.random() * (maximumDelay - minimumDelay);
		window.setTimeout(showRandomMessage, delay);
	}

	const firstDelay = minimumDelay + Math.random() * (maximumDelay - minimumDelay);
	window.setTimeout(showRandomMessage, firstDelay);
});

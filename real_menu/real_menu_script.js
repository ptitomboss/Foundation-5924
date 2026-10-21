document.addEventListener("DOMContentLoaded", () => {
	// Keep notifications at least five seconds apart and no more than ten minutes apart.
	const minimumDelay = 5 * 1000;
	const maximumDelay = 10 * 60 * 1000;
	// Ignore missing or invalid entries so the display always has usable text.
	const messages = Array.isArray(window.randomMessages)
		? window.randomMessages.filter((message) => typeof message === "string" && message.trim())
			.map((message) => message.trim())
		: [];

	// Do not create an empty notification if the shared message list is missing or empty.
	if (messages.length === 0) {
		return;
	}

	// Build the notification in JavaScript so the HTML does not need placeholder markup.
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

	// The close button hides the current message and cancels its auto-dismiss timer.
	let dismissTimeout;
	dismissButton.addEventListener("click", () => {
		notification.hidden = true;
		window.clearTimeout(dismissTimeout);
	});

	let previousMessage = "";

	function showRandomMessage() {
		// Avoid showing the same message twice in a row when there is a choice.
		const availableMessages = messages.length > 1
			? messages.filter((message) => message !== previousMessage)
			: messages;
		const message = availableMessages[Math.floor(Math.random() * availableMessages.length)];

		// textContent displays the message as text rather than interpreting it as HTML.
		messageOutput.textContent = message;
		notification.hidden = false;
		previousMessage = message;
		window.clearTimeout(dismissTimeout);
		dismissTimeout = window.setTimeout(() => {
			notification.hidden = true;
		}, 10 * 1000);

		// Schedule the next message independently of the ten-second display duration.
		const delay = minimumDelay + Math.random() * (maximumDelay - minimumDelay);
		window.setTimeout(showRandomMessage, delay);
	}

	// Wait a random interval before showing the first message, just like later messages.
	const firstDelay = minimumDelay + Math.random() * (maximumDelay - minimumDelay);
	window.setTimeout(showRandomMessage, firstDelay);
});

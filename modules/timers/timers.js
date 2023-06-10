const fs = require("fs");

let timers = [];

let client = null;

async function loadTimers(_client) {
	let _timers = JSON.parse(fs.readFileSync("./modules/timers/timers.json", "utf8"));
	let newTimers = [];
	for (let i = 0; i < _timers.length; i++) {
		let timer = _timers[i];
		newTimers.push({
			interval: setInterval(() => {
				client.sendMessage(timer.message);
			}, timer.time * 1000),
			data: {
				time: timer.time,
				message: timer.message
			}
		});
	}

	timers = newTimers;
	client = _client;
}

// Delete a timer
async function deleteTimer(index) {
	if (index < 0 || index >= timers.length) return;

	clearInterval(timers[index].interval);
	timers.splice(index, 1);
}

// Add a timer
async function addTimer(time, message) {
	timers.push({
		interval: setInterval(() => {
			client.sendMessage(message);
		}
		, time * 1000),
		data: {
			time: time,
			message: message
		}
	});
}

module.exports = {
	loadTimers,
	deleteTimer,
	addTimer
}
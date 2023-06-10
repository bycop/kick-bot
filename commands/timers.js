const fs = require("fs");

module.exports = {
	data: {
		name: "timer"
	},

	async run(client, content, args) {
		if (!args[1]) {
			client.sendMessage("Usage: !timer [add|del|list]");
			return;
		}

		let timers = JSON.parse(fs.readFileSync("./modules/timers/timers.json", "utf8"));

		switch (args[1]) {
			case "add":
				if (!args[2] || !args[3]) {
					client.sendMessage("Usage: !timer add [x s|m|h] [message]");
					return;
				}

				let time = args[2];
				let message = args.slice(3).join(" ");

				let timeUnit = time.slice(-1);
				let timeValue = parseInt(time.slice(0, -1));

				if (isNaN(timeValue)) {
					client.sendMessage("Invalid time value");
					return;
				}

				let timeS = 0;

				switch (timeUnit) {
					case "s":
						timeS = timeValue;
						break;
					case "m":
						timeS = timeValue * 60;
						break;
					case "h":
						timeMs = timeValue * 60 * 60;
						break;
					default:
						client.sendMessage("Invalid time unit");
						return;
				}

				if (timeS < 1 || timeS > 60 * 60 * 24) {
					client.sendMessage("Time must be between 1s and 24h");
					return;
				}

				timers.push({
					time: timeS,
					message: message
				});
				
				fs.writeFileSync("./modules/timers/timers.json", JSON.stringify(timers));

				client.sendMessage(`Timer #${timers.length} added`);
				break;

			case "del":
				if (!args[2]) {
					client.sendMessage("Usage: !timer del [id]");
					return;
				}

				let id = parseInt(args[2]);
				if (isNaN(id) || id < 1 || id > timers.length) {
					client.sendMessage("Invalid id");
					return;
				}

				timers.splice(id - 1, 1);
				fs.writeFileSync("./modules/timers/timers.json", JSON.stringify(timers));

				client.sendMessage(`Timer ${id} deleted`);
				break;

			case "list":
				if (timers.length == 0) {
					client.sendMessage("No timers");
					return;
				}

				let timerList = "Timers: " + timers.map((timer, index) => {
					return `[${index + 1}. "${timer.message}" (${timer.time}s)]`;
				}).join(" ");

				client.sendMessage(timerList);
				break;
		}
	}
}
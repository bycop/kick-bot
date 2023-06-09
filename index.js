const WebSocket = require('ws');
const fs = require('fs');

const channelID = '116295';
const chatroomID = '116293';
const pusherUrl = "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.4.0&flash=false";

const client = {
	commands: []
}

fs.readdir("./commands/", (err, files) => {

	if (err) return console.log(err);

	let jsfile = files.filter(file => file.split(".").pop() === "js");
	if (jsfile.length <= 0) {
		console.log("No commands loaded.");
		return;
	} else {
		console.log("\n\n" + jsfile.length + " commands loaded\n")
	}

	files.forEach(file => {
		if (!file.endsWith(".js")) return;
		let props = require(`./commands/${file}`)
		console.log(`${file} loaded`)

		client.commands.push(props);
	});
});

let ws = new WebSocket(pusherUrl);

function handleMessages(data) {
	console.log(data.sender.username + ": " + data.content)

	let prefix = "!";
	if (!data.content.startsWith(prefix)) return;

	let args = data.content.slice(prefix.length).trim().split(/ +/g);

	let messageArray = data.content.split(" ")
	let cmd = messageArray[0]

	console.log(client.commands, cmd)
	let commandfile = client.commands.find(command => command.data.name === cmd.slice(prefix.length));
	if (commandfile) {
		console.log("Command found")
		commandfile.run(client, data, args, cmd);
	}
	else {
		console.log("Command not found")
	}
}

ws.onopen = () => {
	console.log('WebSocket connection established');

	// Subscribe to the channel
	//   const channelSubscription = {
	//     event: 'pusher:subscribe',
	//     data: {
	//     //   auth: '',
	//       channel: `channel.${channelID}`,
	//     },
	//   };
	//   ws.send(JSON.stringify(channelSubscription));

	// Subscribe to the chatroom
	const chatroomSubscription = {
		event: 'pusher:subscribe',
		data: {
			auth: '',
			channel: `chatrooms.${chatroomID}.v2`,
		},
	};
	ws.send(JSON.stringify(chatroomSubscription));
};

ws.onmessage = (event) => {
	const message = JSON.parse(event.data);

	console.log('Received message: ' + message.event);
	if (message.event === 'App\\Events\\ChatMessageEvent') {
		handleMessages(JSON.parse(message.data));
	}
};

ws.onclose = () => {
	console.log('WebSocket connection closed');

	// Reconnect after 5 seconds
	setTimeout(() => {
		console.log('Reconnecting...');
		ws = new WebSocket(pusherUrl);
	}
		, 5000);
};

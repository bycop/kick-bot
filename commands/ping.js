module.exports = {
	data: {
		name: "ping"
	},
	
	async run(client, content, args) {
		console.log("pong")
		client.sendMessage("pong");
	}
}
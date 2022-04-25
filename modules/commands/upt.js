module.exports.config = {
	name: "uptime",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "D-Jukie",
	description: "Kiểm tra thời gian bot đã online",
	commandCategory: "Admin",
	cooldowns: 0
};
module.exports.run = async ({ api, event, args }) => {
	const { threadID, messageID } = event;
	const fast = require('fast-speedtest-api')
	const speedTest = new fast({
		token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
		verbose: false,
		timeout: 10000,
		https: true,
		urlCount: 5,
		bufferSize: 8,
		unit: fast.UNITS.Mbps
	});
	const resault = await speedTest.getSpeed();
	const time = process.uptime() + global.config.UPTIME;
	const hours = Math.floor(time / (60 * 60))
	const minutes = Math.floor((time % (60 * 60)) / 60)
	const seconds = Math.floor(time % 60);
	return api.sendMessage(`❯ Time: ${hours}:${minutes}:${seconds}\n❯ Fast: ${resault}Mbs`, threadID, messageID);
}

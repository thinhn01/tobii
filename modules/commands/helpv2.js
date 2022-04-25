module.exports.config = {
    name: "help",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Mirai Team",
    description: "Hướng dẫn cho người mới",
    commandCategory: "Danh sách lệnh",
    usages: "[Tên module]",
    cooldowns: 5,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 60
    }
};

module.exports.run = function({ api, event, args }) {
    try {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const command = commands.get((args[0] || "").toLowerCase());
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

    if (args[0] == "all") {
        const command = commands.values();
        var group = [], msg = "";
        for (const commandConfig of command) {
            if (!group.some(item => item.group.toLowerCase() == commandConfig.config.commandCategory.toLowerCase())) group.push({ group: commandConfig.config.commandCategory.toLowerCase(), cmds: [commandConfig.config.name] });
            else group.find(item => item.group.toLowerCase() == commandConfig.config.commandCategory.toLowerCase()).cmds.push(commandConfig.config.name);
        }
        group.forEach(commandGroup => msg += `» ${commandGroup.group.charAt(0).toUpperCase() + commandGroup.group.slice(1)}\n${commandGroup.cmds.join(', ')}\n\n`);
        return api.sendMessage(`=== DANH SÁCH LỆNH ===\n` + msg + `» Số lệnh hiện có: ${commands.size}\n☠NGHIÊM CẤM SỬ DỤNG LỆNH THUỘC PHẦN ADMIN☠`, threadID, async (error, info) =>{
            if (autoUnsend) {
                await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
                return api.unsendMessage(info.messageID);
            } else return;
        });
    }
if (!command) {
    const commandsPush = [];
    const page = parseInt(args[0]) || 1;
    const pageView = 15;
    let i = 0;
    let msg = "=== DANH SÁCH LỆNH ===\n";

    for (var [name, value] of (commands)) {
        name += `
» ${value.config.description}
» Thời gian chờ: ${value.config.cooldowns}s
» Quyền hạn: ${((value.config.hasPermssion == 0) ? `Người dùng` : (value.config.hasPermssion == 1) ? `Quản trị viên nhóm` : `Quản trị viên BOT`)}\n`;
        commandsPush.push(name);
    }

    commandsPush.sort((a, b) => a.data - b.data);

    const first = pageView * page - pageView;
    i = first;
    const helpView = commandsPush.slice(first, first + pageView);

    for (let cmds of helpView)
        msg += `『${++i}』 - ${cmds}\n`;
    const cmdsView = `
» Trang ${page}/${Math.ceil(commandsPush.length/pageView)}
» Hiện tại có ${commandsPush.length} lệnh có thể sử dụng
» HDSD: ${prefix}help <Số trang/all>`;
    return api.sendMessage(msg + cmdsView, threadID,
        async (error, info) => {
            if(error) return console.log(error)
            if (autoUnsend) {
                await new Promise(resolve =>
                    setTimeout(resolve, delayUnsend * 1000));
                return api.unsendMessage(info.messageID);
            } else return;
        });
}
return api.sendMessage(`
» Lệnh: ${command.config.name}
» Thực thi: ${command.config.description}
» Cách sử dụng: ${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : "Chưa có hướng dẫn cụ thể"}
» Thời gian chờ: ${command.config.cooldowns}
» Quyền hạn: ${((command.config.hasPermssion == 0) ? `Người dùng` : (command.config.hasPermssion == 1) ? `Quản trị viên nhóm` : `Quản trị viên BOT`)}`, threadID, messageID);
} catch(e) {
    console.log(e)
    }
};

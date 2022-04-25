module.exports.config = {
	name: "lmkb",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "D-Jukie",
	description: "Xem lời mời kết bạn trên acc bot",
	commandCategory: "Admin",
	usages: "[limit]",
	cooldowns: 0,
};
async function friendRequest(limit) {
  const axios = require("axios");
  var input = limit || 5;
  if(input < 5) return console.log('Limit không được phép bé hơn 5')
  try {
    var body = '';
    var limitPage = input / 5 - 1;
    for(var i = 0; i <= limitPage; i++) {
      var res = (await axios.get(`https://mbasic.facebook.com/friends/center/requests/?ppk=${i}`, { headers: { cookie: global.account.cookie }})).data;
      body += res;
    }
  } 
  catch(e) { console.log(e) }
  const regex_id = /notifications\.php\?confirm\=[^.]+\amp/g
  const found_id = body.match(regex_id);
  const regex_name = /friending_list_id\=[^.]+\<\/a>/g
  const found_name = body.match(regex_name);
  var listID = [];
  var listName = [];
  var data = []
  found_id.map(function(i) {
      const regex2 = /[0-9]/g;
      const found2 = i.match(regex2);
      listID.push(found2.join(''))
  })
  found_name.map(function(i) {
    const regex3 = />[^.]+\</g
    const found3 = i.match(regex3);
    listName.push(found3.join('')
      .replace('>', '')
      .replace('<', '')
    )
  })

  for(let i in listID) {
    data.push({
      name: listName[i],
      uid: listID[i]
    })
  }
  return data
}
module.exports.run = async function({ api, event, args }) {
	const { threadID, messageID } = event;
	var body = '/=====LỜI MỜI KẾT BẠN=====/\n', num = 1;
  if(!args[0] || isNaN(args[0]) || parseInt(args[0]) < 5) return api.sendMessage('Limit nhập vào là 1 số và lớn hơn 5!', threadID, messageID);
  var data = await friendRequest(parseInt(args[0]));
	for(let i of data) {
		if(i.name !== null) {
			body += `${num++}. Tên: ${i.name}\nID: ${i.uid}\n\n`
		}
	}
	body += 'Reply "true" đồng ý, "false" từ chối + số thứ tự, có thể reply nhiều số!'
	return api.sendMessage(body, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      data: data
    })
    }, messageID);
}
module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body } = event;
  const botID = api.getCurrentUserID();
  const { data, author } = handleReply;
  const args = body.split(' ');
  if(args[0] != 'true' && args[0] != 'false') return api.sendMessage('Vui lòng reply true hoặc false + số thứ tự!', threadID, messageID);
  var msg =  "XỬ LÍ LỜI MỜI KẾT BẠN\n";
  var chooses = args.map(n => parseInt(n));
      chooses.shift();
  const success = [];
  const failed = [];
  const names = [];
  const namef = [];
  for(let uid of chooses) {
    const form = {
        av: botID,
        fb_api_req_friendly_name: args[0] == 'true' ? "FriendingCometFriendRequestConfirmMutation" : "FriendingCometFriendRequestDeleteMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: args[0] == 'true' ? "3147613905362928" : "4108254489275063",
        variables: JSON.stringify({
          input: {
            friend_requester_id: data[uid-1].uid,
            source: "friends_tab",
            actor_id: botID,
            client_mutation_id: Math.round(Math.random() * 19).toString()
          },
          scale: 3,
          refresh_num: 0
        })
      };
      try {
        const friendRequest = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        if (JSON.parse(friendRequest).errors) {
          failed.push(data[uid-1].uid);
          namef.push(data[uid-1].name)
        }
        else {
          names.push(data[uid-1].name)
          success.push(data[uid-1].uid);
        }
      }
      catch(e) {
        namef.push(data[uid-1].name)
        failed.push(data[uid-1].uid);
      }
  }
  return api.sendMessage(`» Đã ${args[0] == 'true' ? 'chấp nhận' : 'xóa'} lời mời kết bạn thành công của ${success.length} id, gồm:\n${names.join('\n')}${failed.length > 0 ? `\n» Thất bại với ${failed.length} id: ${failed.join(" ")}, gồm: \n${namef.join('\n')}` : ""}`, threadID, messageID);
}


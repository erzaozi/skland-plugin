import plugin from '../../../lib/plugins/plugin.js'
import Skland from "../components/Code.js";
import Config from "../components/Config.js";

export class BindToken extends plugin {
    constructor() {
        super({
            name: "Skland-用户绑定",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)绑定.*$",
                    fnc: "bindToken"
                },
                {
                    reg: "^#?(skland|(明日)?方舟)解绑.*$",
                    fnc: "unbindToken"
                }
            ]
        })
    }

    async bindToken(e) {
        const token = e.msg.replace(/#?(skland|(明日)?方舟)绑定/g, "").trim();

        if (!token) return await e.reply("请输入正确的Token\n使用[#方舟绑定帮助]查看获取Token方法！");

        const skland = new Skland();
        const { status, message, bindingList, credResp } = await skland.isAvailable(token);

        if (!status) {
            await e.reply(`绑定失败！原因：${message}\n使用[#方舟绑定帮助]查看获取Token方法`);
            return true;
        }

        const userConfig = Config.getUserConfig(e.user_id);
        const userData = {
            userId: credResp.userId,
            token,
            uid: bindingList.map(item => item.uid)
        };
        const userIndex = userConfig.findIndex(item => item.userId === credResp.userId);

        userIndex !== -1 ? (userConfig[userIndex] = userData) : userConfig.push(userData);

        Config.setUserConfig(e.user_id, userConfig);

        const msg = `该账号共绑定 ${bindingList.length} 个角色：` + bindingList.map(item => `\n[${item.channelName}] Dr.${item.nickName} (${item.uid})`).join('');

        return await e.reply(msg);
    }

    async unbindToken(e) {
        let accountList = JSON.parse(await redis.get(`Yunzai:skland:users:${e.user_id}`)) || await Config.getUserConfig(e.user_id);

        if (!accountList || !accountList.length) {
            return await e.reply('当前没有绑定任何账号，请使用[#方舟绑定 + Token]的格式进行绑定');
        }

        let userId = e.msg.replace(/#?(skland|(明日)?方舟)解绑/, '').trim();
        if (!userId || !accountList.map(item => item.userId).includes(userId)) {
            let msg = '当前绑定的账号有：'
            accountList.forEach(item => {
                msg += `\n账号ID：${item.userId}`
                item.uid.forEach(uid => {
                    msg += `\nUID：${uid}`
                })
                msg += `\n`
            })
            msg += `\n请使用[#方舟解绑 + 账号ID]的格式进行解绑。\n注意：解绑后，该账号下的全部UID将被删除`
            await e.reply(msg);
        } else {
            let index = accountList.findIndex(item => item.userId == userId);
            accountList.splice(index, 1);
            await e.reply(`已删除账号 ${userId}`);
            Config.setUserConfig(e.user_id, accountList);
        }
        return true;
    }
}

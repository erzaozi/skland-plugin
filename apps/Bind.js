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
                }
            ]
        })
    }

    async bindToken(e) {
        const token = e.msg.replace(/#?(skland|(明日)?方舟)绑定/g, "").trim();
        const skland = new Skland();
        const { status, message, bindingList, credResp } = await skland.isAvailable(token);

        status || await e.reply(`绑定失败！原因：${message}`);

        const userConfig = Config.getUserConfig(e.user_id);
        const userData = {
            userId: credResp.userId,
            token,
            uid: bindingList.map(item => item.uid)
        };
        const userIndex = userConfig.findIndex(item => item.userId === credResp.user_id);

        userIndex !== -1 ? (userConfig[userIndex] = userData) : userConfig.push(userData);

        Config.setUserConfig(e.user_id, userConfig);
        await redis.set(`Yunzai:skland:${e.user_id}`, JSON.stringify(userConfig));

        const msg = `共绑定${bindingList.length}个角色：` + bindingList.map(item => `\n[${item.channelName}] Dr.${item.nickName} (${item.uid})`).join('');

        return await e.reply(msg);
    }
}

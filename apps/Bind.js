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
        const data = await skland.isAvailable(token);

        if (!data.status) {
            return await e.reply(`绑定失败！原因：${data.message}`);
        }

        const userConfig = Config.getUserConfig(e.user_id);
        const userData = {
            userId: data.credResp.user_id,
            token,
            uid: data.bindingList.map(item => item.uid)
        };

        const userIndex = userConfig.findIndex(item => item.userId === data.credResp.user_id);
        if (userIndex !== -1) {
            userConfig[userIndex] = userData;
        } else {
            userConfig.push(userData);
        }

        Config.setUserConfig(e.user_id, userConfig);
        await redis.set(`Yunzai:skland:${e.user_id}`, JSON.stringify(userConfig));

        return await e.reply("绑定成功！");
    }
}

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

    async bindToken(event) {
        const { user_id, msg } = event;
        const token = msg.replace(/#?skland绑定/g, '');
        const sklandInstance = new Skland();

        try {
            const grantCode = await sklandInstance.getGrantCode(token);
            const credentials = await sklandInstance.getCredResp(grantCode);
            const bindingList = await sklandInstance.getBindingList(credentials);
            const {userId} = credentials;
            const uidList = bindingList.map(item => item.uid);
            let userConfig = Config.getUserConfig(user_id);
            const userData = { userId, token, uid: uidList };

            const userIndex = userConfig.findIndex(item => item.userId === userId);
            if (userIndex !== -1) {
                userConfig[userIndex] = userData;
            } else {
                userConfig.push(userData);
            }

            Config.setUserConfig(user_id, userConfig);
            await redis.set(`Yunzai:skland:${user_id}`, JSON.stringify(userConfig));
            return await event.reply("绑定成功！");
        } catch (error) {
            console.log(error);
            return await event.reply("绑定失败！");
        }
    }
}
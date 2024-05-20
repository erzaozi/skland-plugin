import plugin from '../../../lib/plugins/plugin.js'
import Skland from "../components/Code.js";
import Config from "../components/Config.js";

export class UserInfo extends plugin {
    constructor() {
        super({
            name: "Skland-用户信息",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)信息$",
                    fnc: "userInfo"
                }
            ]
        })
    }

    async userInfo(e) {
        let accountList = JSON.parse(await redis.get(`Yunzai:skland:users:${e.user_id}`)) || await Config.getUserConfig(e.user_id);

        if (!accountList.length) {
            return await e.reply("你还没有绑定任何账号呢，请使用[#方舟绑定 + Token]的格式进行绑定");
        }

        const skland = new Skland();
        let data = [];
        let deleteUserId = [];

        for (let account of accountList) {
            const { status, bindingList, credResp } = await skland.isAvailable(account.token);

            if (!status) {
                data.push({ message: `账号 ${account.userId} 的Token已失效\n以下UID已被删除：\n${account.uid.join('\n')}\n请重新绑定Token` });
                deleteUserId.push(account.userId);
                continue;
            }

            let results = [];
            for (const uid of account.uid) {
                const result = await skland.getUser(uid, credResp, bindingList);
                results.push(result);
            }
            data.push({ message: results });
        }

        if (deleteUserId.length) {
            let newAccountList = accountList.filter(account => !deleteUserId.includes(account.userId));
            await Config.setUserConfig(e.user_id, newAccountList);
        }

        if (data.length === 1) {
            await e.reply(data[0].message);
            return true;
        }

        await e.reply(Bot.makeForwardMsg([{ message: `用户 ${e.user_id}` }, ...data]));
        return true;
    }
}

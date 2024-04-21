import plugin from '../../../lib/plugins/plugin.js'
import Skland from "../components/Code.js";
import Config from "../components/Config.js";

export class Sanity extends plugin {
    constructor() {
        super({
            name: "Skland-理智查询",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)理智值?$",
                    fnc: "querySanity"
                }
            ]
        })
        this.task = {
            name: '[Skland-Plugin] 理智推送',
            fnc: () => this.autoPush(),
            cron: '*/7 * * * *',
            log: true
        }
    }

    async querySanity(e) {
        let accountList = JSON.parse(await redis.get(`Yunzai:skland:${e.user_id}`)) || await Config.getUserConfig(e.user_id);

        if (!accountList.length) {
            return await e.reply("你还没有绑定任何账号呢，请先绑定账号");
        }

        const skland = new Skland();
        let data = [];
        let deleteUserId = [];

        for (let account of accountList) {
            const { status, bindingList, credResp } = await skland.isAvailable(account.token);

            if (!status) {
                data.push({ message: `账号 ${account.userId} 的Token已失效，该账号将被移除` });
                deleteUserId.push(account.userId);
                continue;
            }

            let results = await Promise.all(account.uid.map(uid => skland.getSanity(uid, credResp, bindingList)));
            data.push({ message: results.map(result => result.text).join('\n') });
        }

        if (deleteUserId.length) {
            let newAccountList = accountList.filter(account => !deleteUserId.includes(account.userId));
            await Config.setUserConfig(e.user_id, newAccountList);
        }

        await e.reply(Bot.makeForwardMsg([{ message: `用户 ${e.user_id}` }, ...data]));
        return true;
    }

    async autoPush() {
        const { skland_push_list: autoPushList } = Config.getConfig();
        await Promise.all(autoPushList.map(async user => {
            const [botId, groupId, userId] = user.split(':');
            let accountList = JSON.parse(await redis.get(`Yunzai:skland:${userId}`)) || await Config.getUserConfig(userId);
            if (!accountList.length) {
                return
            }

            const skland = new Skland();
            let data = [];
            let deleteUserId = [];

            for (let account of accountList) {
                const { status, bindingList, credResp } = await skland.isAvailable(account.token);

                if (!status) {
                    data.push({ message: `账号 ${account.userId} 的Token已失效，该账号将被移除` });
                    deleteUserId.push(account.userId);
                    continue;
                }

                const results = await Promise.all(account.uid.map(uid => skland.getSanity(uid, credResp, bindingList)));
                const filterResults = results.filter(result => result.isPush);
                if (filterResults.length) data.push({ message: filterResults.map(result => result.text).join('\n') });
            }
            if (deleteUserId.length) {
                let newAccountList = accountList.filter(account => !deleteUserId.includes(account.userId));
                await Config.setUserConfig(userId, newAccountList);
            }
            if (data.length) {
                if (groupId === "undefined") {
                    await Bot[botId]?.pickUser(userId).sendMsg(Bot.makeForwardMsg([{ message: `用户 ${userId}` }, ...data]))
                } else {
                    await Bot[botId]?.pickGroup(groupId).sendMsg(Bot.makeForwardMsg([{ message: `用户 ${userId}` }, ...data]))
                }
            }
            return true;
        }))
    }
}

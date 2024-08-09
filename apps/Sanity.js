import plugin from '../../../lib/plugins/plugin.js'
import Skland from "../components/Code.js";
import Config from "../components/Config.js";

export class Sanity extends plugin {
    constructor() {
        super({
            name: "Skland-实时数据",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)?(理智|实时数据)$",
                    fnc: "querySanity"
                }
            ]
        })
        this.task = {
            name: '[Skland-Plugin] 理智推送',
            fnc: () => this.autoPush(),
            cron: '*/7 * * * *',
            log: false
        }
    }

    async querySanity(e) {
        let accountList = JSON.parse(await redis.get(`Yunzai:skland:users:${e.user_id}`)) || await Config.getUserConfig(e.user_id);

        if (!accountList.length) {
            return await e.reply("你还没有绑定任何账号呢，请使用[#方舟绑定 + Token]的格式进行绑定");
        }

        const skland = new Skland();
        let data = [];
        let deleteUserId = [];

        for (let account of accountList) {
            const { status, bindingList, credResp, message, code } = await skland.isAvailable(account.token);

            if (!status) {
                if (code === 401) {
                    data.push({ message: `账号 ${account.userId} 的Token已失效\n以下UID已被删除：\n${account.uid.join('\n')}\n请重新绑定Token` });
                    deleteUserId.push(account.userId);
                    continue;
                } else {
                    data.push({ message: `账号 ${account.userId} 请求失败\n原因：${message}` });
                    continue;
                }
            }

            let results = [];
            for (const uid of account.uid) {
                const result = await skland.getSanity(uid, credResp, bindingList, true);
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

    async autoPush() {
        const { skland_auto_push_list: autoPushList } = Config.getConfig();
        await Promise.all(autoPushList.map(async user => {
            const [botId, groupId, userId] = user.split(':');
            let accountList = JSON.parse(await redis.get(`Yunzai:skland:users:${userId}`)) || await Config.getUserConfig(userId);
            if (!accountList.length) {
                return
            }

            const skland = new Skland();
            let data = [];
            let deleteUserId = [];

            for (let account of accountList) {
                const { status, bindingList, credResp, message, code } = await skland.isAvailable(account.token);

                if (!status) {
                    if (code === 401) {
                        data.push({ message: `账号 ${account.userId} 的Token已失效\n以下UID已被删除：\n${account.uid.join('\n')}\n请重新绑定Token` });
                        deleteUserId.push(account.userId);
                        continue;
                    } else {
                        data.push({ message: `账号 ${account.userId} 请求失败\n原因：${message}` });
                        continue;
                    }
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
                if (data.length === 1) {
                    if (groupId === "undefined") {
                        await Bot[botId]?.pickUser(userId).sendMsg(data[0].message)
                    } else {
                        await Bot[botId]?.pickGroup(groupId).sendMsg([segment.at(userId), data[0].message])
                    }
                    return true;
                } else {
                    if (groupId === "undefined") {
                        await Bot[botId]?.pickUser(userId).sendMsg(Bot.makeForwardMsg([{ message: `用户 ${userId}` }, ...data]))
                    } else {
                        await Bot[botId]?.pickGroup(groupId).sendMsg(segment.at(userId))
                        await Bot[botId]?.pickGroup(groupId).sendMsg(Bot.makeForwardMsg([{ message: `用户 ${userId}` }, ...data]))
                    }
                }
            }
            return true;
        }))
    }
}

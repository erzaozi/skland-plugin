import plugin from '../../../lib/plugins/plugin.js'
import Skland from "../components/Code.js";
import Config from "../components/Config.js";

export class SignIn extends plugin {
    constructor() {
        super({
            name: "Skland-用户签到",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)签到$",
                    fnc: "signIn"
                }
            ]
        })
        this.task = {
            name: '[skland-plugin] 自动签到',
            fnc: () => this.autoSignIn(),
            cron: '0 4 * * *',
            log: true
        }
    }

    async signIn(e) {
        let accountList = JSON.parse(await redis.get(`Yunzai:skland:${e.user_id}`)) || await Config.getUserConfig(e.user_id);

        if (!accountList.length) {
            return await e.reply("你还没有绑定任何账号呢，请先绑定账号");
        }

        const skland = new Skland();
        const data = [];
        let deleteUserId = [];

        for (let account of accountList) {
            const { status, bindingList, credResp } = await skland.isAvailable(account.token);

            if (!status) {
                data.push({ message: `账号${account.userId}的Token已失效，该账号将被移除` });
                deleteUserId.push(account.userId);
                continue;
            }

            let messages = await Promise.all(account.uid.map(uid => skland.doSignIn(uid, credResp, bindingList).then(({ text }) => `${text}\n`)));
            data.push({ message: messages.join('') });
        }

        if (deleteUserId.length) {
            let newAccountList = accountList.filter(account => !deleteUserId.includes(account.userId))
            await Config.setUserConfig(e.user_id, newAccountList)
        }

        await e.reply(Bot.makeForwardMsg(data));
        return true;
    }

    async autoSignIn() {
        const { skland_auto_signin_list: autoSignInList } = Config.getConfig();
        let successNumber = 0;
        for (let user of autoSignInList) {
            const [botId, groupId, userId] = user.split(':');
            const accountList = JSON.parse(await redis.get(`Yunzai:skland:${userId}`)) || await Config.getUserConfig(userId);
            if (!accountList.length) {
                continue;
            }

            let data = [];
            let deleteUserId = [];

            for (let account of accountList) {
                const skland = new Skland();
                const { status, bindingList, credResp } = await skland.isAvailable(account.token);

                if (!status) {
                    data.push({ message: `账号${account.userId}的Token已失效，该账号将被移除` })
                    deleteUserId.push(account.userId)
                    continue;
                }

                let results = await Promise.all(account.uid.map(uid => skland.doSignIn(uid, credResp, bindingList)));
                for (let result of results) {
                    if (result.status) successNumber++
                }
                await new Promise(resolve => setTimeout(resolve, 53000 + Math.floor((Math.random() * 42000))))
            }
            if (deleteUserId.length) {
                let newAccountList = accountList.filter(account => !deleteUserId.includes(account.userId))
                await Config.setUserConfig(userId, newAccountList)
            }
            if (data.length) Bot[botId]?.pickUser(userId).sendMsg(Bot.makeForwardMsg(data))
        }
        Bot.sendMasterMsg?.('[skland-plugin] 今日执行自动签到账号数量: ' + successNumber)
    }
}

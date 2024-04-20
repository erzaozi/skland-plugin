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

        for (let account of accountList) {
            const { status, bindingList, credResp } = await skland.isAvailable(account.token);

            if (!status) {
                data.push({ message: "该账号的Token已失效，该账号将被移除" });
                continue;
            }

            let messages = await Promise.all(account.uid.map(uid => skland.doSignIn(uid, credResp, bindingList).then(({ text }) => `${text}\n`)));
            data.push({ message: messages.join('') });
        }
        logger.info(data)
        await e.reply(Bot.makeForwardMsg(data));
        return true;
    }

    async autoSignIn() {
        const { skland_auto_signin_list: autoSignInList } = Config.getConfig();
        let successNumber = 0;
        for (let user of autoSignInList) {
            let message = []

            const [botId, groupId, userId] = user.split(':');
            const accountList = JSON.parse(await redis.get(`Yunzai:skland:${userId}`)) || await Config.getUserConfig(user);
            if (accountList.length === 0) {
                continue;
            }

            for (let account of accountList) {
                const skland = new Skland();
                const { status, bindingList, credResp } = await skland.isAvailable(account.token);

                if (!status) {
                    message.push(`账号${account.userId}的Token已失效，该账号将被移除`)
                    continue;
                }

                let results = await Promise.all(account.uid.map(uid => skland.doSignIn(uid, credResp, bindingList)));
                for (let result of results) {
                    if (result.status) successNumber++
                }
                await new Promise(resolve => setTimeout(resolve, 53000 + Math.floor((Math.random() * 42000))))
            }
            if (message.length !== 0) Bot[botId]?.pickUser(userId).sendMsg(Bot.makeForwardMsg({ message: message.join('\n') }))
        }
        Bot.sendMasterMsg?.('[skland-plugin] 今日执行自动签到账号数量: ' + successNumber)
    }
}

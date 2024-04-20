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
}

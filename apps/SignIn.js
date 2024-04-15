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
                    reg: "^#?skland签到$",
                    fnc: "signIn"
                }
            ]
        })
    }

    async signIn(e) {
        let user_id = e.user_id;
        let accountList = await Config.getUserConfig(user_id)

        if (accountList.length === 0) {
            await e.reply("你还没有绑定任何账号呢，请先绑定账号")
            return true
        }

        const sklandInstance = new Skland();

        let msg = "======Skland签到结果======"
        for (let item of accountList) {
            let uidList = item.uid;
            let token = item.token
            for (let uid of uidList) {
                await sklandInstance.runSignIn(uid, token).then(res => {
                    if (res.status) {
                        msg += res.text
                    }
                })
            }
        }
        await e.reply(msg)
        return true
    }
}
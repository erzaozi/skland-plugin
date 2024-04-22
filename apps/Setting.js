import plugin from "../../../lib/plugins/plugin.js"
import Config from "../components/Config.js"

export class Setting extends plugin {
    constructor() {
        super({
            name: "Skland-用户设置",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)(开启|关闭)自动签到$",
                    fnc: "setAutoSign"
                },
                {
                    reg: "^#?(skland|(明日)?方舟)(开启|关闭)理智推送$",
                    fnc: "setAutoPush"
                }
            ]
        })
    }

    async setAutoSign(e) {
        const accountList = JSON.parse(await redis.get(`Yunzai:skland:${e.user_id}`)) || await Config.getUserConfig(e.user_id);
        if (!accountList.length) return e.reply("你还没有绑定任何账号呢，请先绑定账号");

        const config = await Config.getConfig();
        const key = `${e.self_id}:${e.group_id}:${e.user_id}`;
        const index = config["skland_auto_signin_list"].indexOf(key);

        if (e.msg.includes('开启')) {
            if (index === -1) {
                config["skland_auto_signin_list"].push(key);
                Config.setConfig(config);
                return e.reply("已开启自动签到");
            }
            return e.reply("你已经开启了自动签到");
        }

        if (index !== -1) {
            config["skland_auto_signin_list"].splice(index, 1);
            Config.setConfig(config);
            return e.reply("已关闭自动签到");
        }
        return e.reply("你已经关闭了自动签到");
    }

    async setAutoPush(e) {
        const accountList = JSON.parse(await redis.get(`Yunzai:skland:${e.user_id}`)) || await Config.getUserConfig(e.user_id);
        if (!accountList.length) return e.reply("你还没有绑定任何账号呢，请先绑定账号");

        const config = await Config.getConfig();
        const key = `${e.self_id}:${e.group_id}:${e.user_id}`;
        const index = config["skland_auto_push_list"].indexOf(key);

        if (e.msg.includes('开启')) {
            if (index === -1) {
                config["skland_auto_push_list"].push(key);
                Config.setConfig(config);
                return e.reply("已开启理智推送");
            }
            return e.reply("你已经开启了理智推送");
        }

        if (index !== -1) {
            config["skland_auto_push_list"].splice(index, 1);
            Config.setConfig(config);
            return e.reply("已关闭理智推送");
        }
        return e.reply("你已经关闭了理智推送");
    }
}

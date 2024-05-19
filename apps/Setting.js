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
                    reg: "^#?(skland|(明日)?方舟)(开启|关闭)(理智)?推送$",
                    fnc: "setAutoPush"
                },
                {
                    reg: "^#?(skland|(明日)?方舟)设置(MAA|Maa|maa).*$",
                    fnc: "setMaa"
                }
            ]
        })
    }

    async setMaa(e) {
        let config = await Config.getConfig();
        let device = e.msg.replace(/^#?(skland|(明日)?方舟)设置(MAA|Maa|maa)/, '').trim();
        let user = e.user_id;
        config.maa_user_list = config.maa_user_list.filter(item => item.split(':')[0] !== user.toString());
        config.maa_user_list = config.maa_user_list.concat(`${user}:${device}`);
        Config.setConfig(config);
        return e.reply(`已绑定Maa设备：${device}`);
    }

    async setAutoSign(e) {
        const accountList = JSON.parse(await redis.get(`Yunzai:skland:users:${e.user_id}`)) || await Config.getUserConfig(e.user_id);
        if (!accountList.length) return e.reply("你还没有绑定任何账号呢，请使用[#方舟绑定 + Token]的格式进行绑定");

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
        const accountList = JSON.parse(await redis.get(`Yunzai:skland:users:${e.user_id}`)) || await Config.getUserConfig(e.user_id);
        if (!accountList.length) return e.reply("你还没有绑定任何账号呢，请使用[#方舟绑定 + Token]的格式进行绑定");

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

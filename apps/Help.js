import plugin from '../../../lib/plugins/plugin.js';
import { pluginResources } from '../model/path.js';

export class Help extends plugin {
    constructor() {
        super({
            name: "Skland-帮助",
            event: "message",
            priority: 1008,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)帮助$",
                    fnc: "help"
                },
                {
                    reg: "^#?(skland|(明日)?方舟)绑定帮助$",
                    fnc: "bindHelp"
                }
            ]
        })
    }

    async help(e) {
        const helpList = [
            '======Skland-Plugin======',
            '#skland签到',
            '#skland(开启|关闭)自动签到',
            '#skland理智值',
            '#skland(开启|关闭)理智推送',
            '#skland绑定',
            '#skland绑定帮助',
            '#skland帮助',
            '#skland更新'
        ]
        await e.reply(helpList.join('\n'))
        return true
    }
    async bindHelp(e) {
        const helpStep = [
            { message: '1.浏览器打开 https://www.skland.com 登录账号' },
            { message: '2.再次打开 https://web-api.skland.com/account/info/hg' },
            { message: '3.复制 data.content 里的值（不带两边冒号）' },
            { message: segment.image(pluginResources + '/token/Token.png') },
        ]
        await e.reply(Bot.makeForwardMsg(helpStep))
        return true
    }
}

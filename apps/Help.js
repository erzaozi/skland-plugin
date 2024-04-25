import plugin from '../../../lib/plugins/plugin.js';

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
            { message: '1.浏览器打开https://www.skland.com登录账号' },
            { message: '2.打开https://web-api.skland.com/account/info/hg' },
            { message: '3.复制data.content里的值' },
            { message: segment.image('https://gchat.qpic.cn/gchatpic_new/166741303/674492896-2241515058-2C1530E5F1040ACDD029926D5F83DEB6/0?term=2') }
        ]
        await e.reply(Bot.makeForwardMsg(helpStep))
        return true
    }
}

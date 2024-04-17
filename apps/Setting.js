import plugin from "../../../lib/plugins/plugin.js"
import Skland from "../components/Code.js"
import Config from "../components/Config.js"
import Log from "../utils/logs.js"

export class Setting extends plugin {
    constructor() {
        super({
            name: "Skland-用户设置",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)(开启|关闭)(自动签到|体力推送)$",
                    fnc: "userSetting"
                }
            ]
        })
        this.task = [
            {
                name: '[Skland-plugin]自动签到',
                fnc: async () => this.autoSignIn(),
                cron: '0 4 * * *',
                log: true
            },
            {
                name: '[Skland-plugin]体力推送',
                fnc: () => this.autoPush(),
                cron: '7 * * * *',
                log: true
            }
        ]
    }

    async userSetting(e) {
        let config = Config.getConfig()
        const { user_id: userId, self_id: selfId } = e
        const [, value, key] = /(开启|关闭)(自动签到|体力推送)$/.exec(e.msg) || []
        if (!value || !key) return await e.reply('请检查配置指令')
        let alterFlag = false
        switch (key) {
            case '自动签到':
                const indexSignIn = config["skland_auto_signin_list"].indexOf(`${selfId}:${userId}`)
                if (value === '开启' && indexSignIn === -1) {
                    config.push(`${selfId}:${userId}`)
                    alterFlag = true
                } else if (value === '关闭' && indexSignIn !== -1) {
                    config.splice(`${selfId}:${userId}`, 1)
                    alterFlag = true
                }
                break
            case '体力推送':
                const indexPush = config['skland_push_list'].indexOf(userId)
                if (value === '开启' && indexPush === -1) {
                    config.push(userId)
                    alterFlag = true
                } else if (value === '关闭' && indexPush !== -1) {
                    config.splice(userId, 1)
                    alterFlag = true
                }
                break
            default:
        }
        try {
            if (alterFlag === true) {
                Config.setConfig(config)
            }
            e.reply(`用户:${userId} 已${value}${key}`)
            Log.m(`[skland-plugin]更新配置`, userId, key, value)
        } catch (err) {
            e.reply("配置文件修改失败，请查看控制台")
            Log.e(err)
        }
        return true
    }

    async autoPush() {
        const { skland_push_list: pushList } = Config.getConfig()
        await Promise.allSettled(pushList.map(async user => {

        }))
    }

    async autoSignIn() {
        const { skland_auto_signin_list: autoSignInList } = Config.getConfig()
        let successNumberList = await Promise.allSettled(autoSignInList.map(async user => {
            const accountList = JSON.parse(await redis.get(`Yunzai:skland:${user}`)) || await Config.getUserConfig(user)
            if (accountList.length === 0) {
                return null
            }
            const sklandInstance = new Skland()
            let successNumber = 0
            for (let item of accountList) {
                let uidList = item.uid;
                let token = item.token
                for (let uid of uidList) {
                    await sklandInstance.runSignIn(uid, token).then(res => {
                        if (res.status) {
                            successNumber++
                        }
                    })
                }
            }
            Log.m('今日完成自动签到数量: ' + successNumberList.filter(number => number).reduce((total, num) => total + num, 0))
        }))
    }
}
import plugin from '../../../lib/plugins/plugin.js'
import UserApi from '../model/userApi.js'

export class skland extends plugin {
    constructor() {
        super({
            name: '森空岛绑定列表',
            dsc: '森空岛绑定列表',

            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 5000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?方舟绑定列表$',
                    /** 执行方法 */
                    fnc: 'sign_list',
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?方舟uid[0-9]*$',
                    /** 执行方法 */
                    fnc: 'use_uid',
                }
            ]
        })
    }
    async sign_list(e) {
        let uid = await UserApi.get_uid_by_user_id(e.user_id)
        if (uid.length == 0) {
            e.reply('未绑定森空岛账号，请先绑定后再试')
            return true
        }
        let defaultUid = await redis.get(`skland:defaultUid:${e.user_id}`)
        if (defaultUid == null) {
            defaultUid = uid[0]
        } else {
            defaultUid = parseInt(defaultUid)
        }
        await redis.set(`skland:defaultUid:${e.user_id}`, defaultUid)
        let msg = '明日方舟绑定列表：'
        for (let i = 0; i < uid.length; i++) {
            let item = uid[i]
            let nickName = await UserApi.get_nickname_by_uid(e.user_id, item)
            if (item == defaultUid) {
                msg += `\n${i + 1}.${nickName}(${item})[正在使用]`
            } else {
                msg += `\n${i + 1}.${nickName}(${item})`
            }
        }
        e.reply(msg)
        return true
    }
    async use_uid(e) {
        let uid = await UserApi.get_uid_by_user_id(e.user_id)
        if (uid.length == 0) {
            e.reply('未绑定森空岛账号')
        }
        if (e.raw_message.replace(/#?方舟uid/, '') == '') {
            this.sign_list(e)
            return true
        }
        console.log(e.raw_message.replace(/#?方舟uid/, ''), uid)
        if (uid.includes(e.raw_message.replace(/#?方舟uid/, ''))) {
            await redis.set(`skland:defaultUid:${e.user_id}`, parseInt(e.raw_message.replace(/#?方舟uid/, '')))
            this.sign_list(e)
            return true
        }
        let index = parseInt(e.raw_message.replace(/#?方舟uid/, ''))
        if (index > uid.length) {
            e.reply('没有这个UID，当前账号绑定了' + uid.length + '个UID')
        } else {
            await redis.set(`skland:defaultUid:${e.user_id}`, uid[index - 1])
        }
        this.sign_list(e)
        return true
    }
}
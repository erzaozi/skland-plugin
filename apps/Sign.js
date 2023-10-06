import plugin from '../../../lib/plugins/plugin.js'
import CoreApi from '../model/coreApi.js'
import UserApi from '../model/userApi.js'

export class skland extends plugin {
    constructor() {
        super({
            name: '森空岛签到',
            dsc: '森空岛签到',

            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 5000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?方舟签到$',
                    /** 执行方法 */
                    fnc: 'sign',
                },
            ]
        })
    }
    async sign(e) {
        let uid = await UserApi.get_uid_by_user_id(e.user_id)
        if (uid.length == 0) {
            e.reply('未绑定森空岛账号')
        }
        let msg = '明日方舟签到结果：'
        for (let i = 0; i < uid.length; i++) {
            let item = uid[i]
            let cred = await UserApi.get_cred_by_uid(e.user_id, item)
            console.log('UID', item, 'CRED', cred)
            let res = await CoreApi.sign(item, cred)
            let nickName = await UserApi.get_nickname_by_uid(e.user_id, item)
            if (res.code != 0) {
                msg += `\n${nickName}(${item})签到失败了！原因：${res.message}`
                continue
            } else {
                for (let j of res.data.awards) {
                    let item2 = j.resource
                    msg += `\n${nickName}(${item})签到成功！获得${item2.name}×${j.count ? j.count : 1}`
                }
            }
        }
        e.reply(msg)
    }
}
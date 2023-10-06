import plugin from '../../../lib/plugins/plugin.js'
import CoreApi from '../model/coreApi.js'

// 临时存储数据
var listen = []

export class skland extends plugin {
    constructor() {
        super({
            name: '森空岛登录',
            dsc: '森空岛登录',

            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 5000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?方舟验证码登录$',
                    /** 执行方法 */
                    fnc: 'login_by_code',
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?方舟密码登录$',
                    /** 执行方法 */
                    fnc: 'login_by_password',
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?方舟(T|t)oken登录$',
                    /** 执行方法 */
                    fnc: 'login_by_token',
                },
                {
                    /** 命令正则匹配 */
                    reg: '',
                    /** 执行方法 */
                    fnc: 'listen',
                    /** 关闭日志 */
                    log: false
                }
            ]
        })
    }
    async login_by_code(e) {
        e.reply('请输入手机号码：')
        listen[e.user_id] = {
            'type': 'login_by_code',
            'phone': '',
            'code': '',
            'step': 1
        }
    }
    async login_by_password(e) {
        e.reply('请输入手机号码：')
        listen[e.user_id] = {
            'type': 'login_by_password',
            'phone': '',
            'code': '',
            'step': 1
        }
    }
    async login_by_token(e) {
        e.reply('请输入Token：\n（登录森空岛电脑官网后，请访问这个网址：https://web-api.skland.com/account/info/hg）')
        listen[e.user_id] = {
            'type': 'login_by_token',
            'token': '',
            'step': 1
        }
    }
    async listen(e) {
        // 判断是否在监听中
        if (listen[e.user_id] == undefined) return false
        // 判断是否为验证码登录
        if (listen[e.user_id].type == 'login_by_code' && listen[e.user_id].step == 1) {
            // 判断是否为手机号码
            if (!/^1[3456789]\d{9}$/.test(e.msg)) {
                e.reply('请输入正确的手机号码：')
                return false
            }
            listen[e.user_id].phone = e.msg
            // 发送验证码
            let res = await CoreApi.get_code(e.msg)
            // 判断是否发送成功
            if (res.status != 0) {
                e.reply('发送手机验证码出现错误：' + res.msg)
                return false
            }
            e.reply('请输入手机验证码：')
            listen[e.user_id].step = 2
            // 判断是否为密码登录
        } else if (listen[e.user_id].type == 'login_by_password' && listen[e.user_id].step == 1) {
            listen[e.user_id].phone = e.msg
            e.reply('请输入密码：')
            listen[e.user_id].step = 2
            // 判断是否为Token登录
        } else if (listen[e.user_id].type == 'login_by_token' && listen[e.user_id].step == 1) {
            // 解析token
            let token = await parse_user_token(e.msg)
            if (token == undefined) {
                e.reply('请输入正确的Token：')
                return false
            }
            await get_something(e, token)
        } else if (listen[e.user_id].type == 'login_by_code' && listen[e.user_id].step == 2) {
            // 判断是否为验证码
            if (!/^\d{6}$/.test(e.msg)) {
                e.reply('请输入正确的验证码：')
                return false
            }
            // 获取token
            let res = await CoreApi.get_token_by_phone_code(listen[e.user_id].phone, e.msg)
            if (res.status != 0) {
                e.reply('获得token失败：' + res.msg)
                listen[e.user_id] = undefined
                return false
            }
            await get_something(e, res.data.token)
        } else if (listen[e.user_id].type == 'login_by_password' && listen[e.user_id].step == 2) {
            // 获取token
            let res = await CoreApi.get_token_by_password(listen[e.user_id].phone, e.msg)
            if (res.status != 0) {
                e.reply('获得token失败：' + res.msg)
                listen[e.user_id] = undefined
                return false
            }
            await get_something(e, res.data.token)
        } else {
            console.log(`[${listen[e.user_id]}]用户数据出现非预期类型，已清除`)
            listen[e.user_id] = undefined
            return false
        }
    }
}
/**
 * 
 * @param {*} e 
 * @param {string} token 用户Token
 * @returns 
 */
async function get_something(e, token) {
    // 获取grant
    let res = await CoreApi.get_grant_code(token)
    if (res.status != 0) {
        e.reply('获得认证代码失败：' + res.msg)
        listen[e.user_id] = undefined
        return false
    }
    // 获取cred
    res = await CoreApi.get_cred(res.data.code)
    if (res.code != 0) {
        e.reply('获得cred失败：' + res.message)
        listen[e.user_id] = undefined
        return false
    }
    // 检查账号状态
    let is_login = await CoreApi.is_login(res.data.cred)
    if (is_login == 0) {
        e.reply('登录已失效，请重新登录')
        listen[e.user_id] = undefined
        return false
    } else if (is_login == 1) {
        e.reply('登录成功，但是该账号未绑定任何明日方舟角色，请先绑定角色')
        listen[e.user_id] = undefined
        return false
    }
    // 存入redis
    await save_user(e, res.data.cred)
    res = await CoreApi.get_binding_list(res.data.cred)
    // 欢迎
    let msg = []
    let bindingList = res.data.list.find(item => item.appCode == 'arknights').bindingList
    for (let i = 0; i < bindingList.length; i++) {
        let item = bindingList[i]
        msg.push(`欢迎${item.nickName}，您的UID为${item.uid}[${item.channelName}]`)
    }
    e.reply(msg.join('\n'))
    if (res.data.list.find(item => item.appCode == 'arknights').defaultUid == undefined) {
        // 使用第一个角色
        await redis.set(`skland:defaultUid:${e.user_id}`, bindingList[0].uid)
    } else {
        // 使用默认角色
        await redis.set(`skland:defaultUid:${e.user_id}`, res.data.list.find(item => item.appCode == 'arknights').defaultUid)
    }
    listen[e.user_id] = undefined
    return true
}

/**
 * 解析用户Token
 * @param {string} token 用户Token
 * @returns {string} 返回用户Token
 */
async function parse_user_token(token) {
    try {
        token = JSON.parse(token)
        return token['data']['content']
    } catch (error) {
        return token
    }
}

/**
 * 
 * @param {*} e 
 * @param {string} cred 本次登录的cred
 */
async function save_user(e, cred) {
    let infoRes = await CoreApi.get_binding_list(cred)
    if (infoRes.code != 0) {
        e.reply('请求角色列表出现问题：' + infoRes.message)
    }
    let info = infoRes.data
    let allUser = await redis.get(`skland:userCred`)
    if (allUser == null) {
        allUser = {}
    } else {
        allUser = JSON.parse(allUser)
    }
    if (allUser[e.user_id] == undefined) {
        allUser[e.user_id] = [
            {
                'cred': cred,
                'info': info
            }
        ]
    } else {
        let isExist = false
        for (let i = 0; i < allUser[e.user_id].length; i++) {
            let item = allUser[e.user_id][i]
            for (let j = 0; j < info.list.length; j++) {
                let item2 = info.list[j]
                for (let k = 0; k < item2.bindingList.length; k++) {
                    let item3 = item2.bindingList[k]
                    console.log(item3.uid, item.info.list[j].bindingList[k].uid)
                    if (item3.uid == item.info.list[j].bindingList[k].uid) {
                        allUser[e.user_id][i] = {
                            'cred': cred,
                            'info': info
                        }
                        isExist = true
                        break
                    }
                }
                if (isExist) break
            }
            if (isExist) break
        }
        if (!isExist) {
            allUser[e.user_id].push({
                'cred': cred,
                'info': info
            })
        }
    }
    // 保存用户信息
    await redis.set(`skland:userCred`, JSON.stringify(allUser))
}

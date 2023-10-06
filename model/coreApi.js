import axios from 'axios'

const app_code = '4ca99fa6b56cc2ba'

// 签到url
const sign_url = "https://zonai.skland.com/api/v1/game/attendance"
// 绑定的角色url
const binding_url = "https://zonai.skland.com/api/v1/game/player/binding"
// 验证码url
const login_code_url = "https://as.hypergryph.com/general/v1/send_phone_code"
// 验证码登录
const token_phone_code_url = "https://as.hypergryph.com/user/auth/v2/token_by_phone_code"
// 密码登录
const token_password_url = "https://as.hypergryph.com/user/auth/v1/token_by_phone_password"
// 使用token获得认证代码
const grant_code_url = "https://as.hypergryph.com/user/oauth2/v2/grant"
// 使用认证代码获得cred
const cred_code_url = "https://zonai.skland.com/api/v1/user/auth/generate_cred_by_code"

// 获取数据的Header
const header = {
    'cred': '',
    'User-Agent': 'Skland/1.0.1 (com.hypergryph.skland; build:100001014; Android 31; ) Okhttp/4.11.0',
    'Accept-Encoding': 'gzip',
    'Connection': 'close'
}
// 登录的Header
const header_login = {
    'User-Agent': 'Skland/1.0.1 (com.hypergryph.skland; build:100001014; Android 31; ) Okhttp/4.11.0',
    'Accept-Encoding': 'gzip',
    'Connection': 'close'
}

class CoreApi {

    /**
     * 发送验证码
     * @param {string} phone 手机号码
     * @returns {object} 返回数据
     */
    async get_code(phone) {
        try {
            let res = await axios.post(login_code_url, {
                'phone': phone,
                'type': 2,
            }, {
                headers: header_login
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }

    /**
     * 使用验证码登录
     * @param {string} phone 手机号码
     * @param {string} code 验证码
     * @returns {object} 返回数据
     */
    async get_token_by_phone_code(phone, code) {
        try {
            let res = await axios.post(token_phone_code_url, {
                'phone': phone,
                'code': code,
            }, {
                headers: header_login
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }

    /**
     * 使用密码登录
     * @param {string} phone 手机号码
     * @param {string} password 密码
     * @returns {object} 返回数据
     */
    async get_token_by_password(phone, password) {
        try {
            let res = await axios.post(token_password_url, {
                'phone': phone,
                'password': password,
            }, {
                headers: header_login
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }

    /**
     * 使用Token获得认证代码
     * @param {string} token 用户Token
     * @returns {object} 返回数据
     */
    async get_grant_code(token) {
        try {
            let res = await axios.post(grant_code_url, {
                'appCode': app_code,
                'token': token,
                'type': 0,
            }, {
                headers: header_login
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }

    /**
     * 使用认证代码获得cred
     * @param {string} grant 认证代码
     * @returns {object} 返回数据
     */
    async get_cred(grant) {
        try {
            let res = await axios.post(cred_code_url, {
                'code': grant,
                'kind': 1,
            }, {
                headers: header_login
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }

    /**
     * 
     * @param {string} cred 用户cred
     * @returns 如果失效返回0，如果未绑定返回1，如果绑定返回2
     */
    async is_login(cred) {
        header.cred = cred
        try {
            let res = await this.get_binding_list(cred)
            let arknights = res.data.list.find(item => item.appCode == 'arknights')
            if (arknights == undefined) {
                return 1
            }
            return 2
        } catch (error) {
            return 0
        }
    }

    /**
     * 获取绑定的角色
     * @param {string} cred 用户cred
     * @returns {object} 返回数据
     */
    async get_binding_list(cred) {
        header.cred = cred
        try {
            let res = await axios.get(binding_url, {
                headers: header
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }

    /**
     * 签到
     * @param {*} uid 签到的uid
     * @param {*} cred 用户cred
     * @returns 
     */
    async sign(uid, cred) {
        header.cred = cred
        try {
            let res = await axios.post(sign_url, {
                'uid': uid,
                'gameId': 1
            }, {
                headers: header
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }

    /**
     * 获取用户信息
     * @param {number} uid 用户uid
     * @param {string} cred 用户cred
     * @returns
     */
    async get_user_info(uid, cred) {
        header.cred = cred
        try {
            let res = await axios.get('https://zonai.skland.com/api/v1/game/player/info?uid=' + uid, {
                headers: header
            })
            return res.data
        } catch (error) {
            return error.response.data
        }
    }
}

export default new CoreApi()
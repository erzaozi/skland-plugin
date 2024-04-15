import crypto from 'crypto';
import url from 'url';
import axios from 'axios';
import Config from './Config.js'

const CONSTANTS = {
    APP_CODE: "4ca99fa6b56cc2ba",
    SIGN_URL: "https://zonai.skland.com/api/v1/game/attendance",
    BINDING_URL: "https://zonai.skland.com/api/v1/game/player/binding",
    GRANT_CODE_URL: "https://as.hypergryph.com/user/oauth2/v2/grant",
    CRED_CODE_URL: "https://zonai.skland.com/api/v1/user/auth/generate_cred_by_code",
    USER_INFO_URL: "https://zonai.skland.com/api/v1/game/player/info",
    CRED_CHECK_URL: "https://zonai.skland.com/api/v1/user/check",
    REQUEST_HEADERS_BASE: {
        "User-Agent": "Skland/1.5.1 (com.hypergryph.skland; build:100501001; Android 33; ) Okhttp/4.11.0",
        "Accept-Encoding": "gzip",
        "Connection": "close",
        "Origin": "https://www.skland.com",
        "Referer": "https://www.skland.com/",
        "Content-Type": "application/json; charset=utf-8",
        "manufacturer": "Xiaomi",
        "os": "33",
    },
    SIGN_HEADERS_BASE: {
        "platform": "1", "timestamp": "", "dId": "de9759a5afaa634f", "vName": "1.5.1"
    }
};

class Skland {
    constructor() {
    }

    async getTimestamp() {
        let config = await Config.getConfig()
        if (config['skland_use_web_timestamp']) {
            const response = await axios.get(CONSTANTS.BINDING_URL);
            return response.data.timestamp;
        } else {
            return String(Math.floor(Date.now() / 1000) - config['skland_timestamp_delay']);
        }
    }

    async generateSignature(token, path, bodyOrQuery, timestamp) {
        let headerCa = Object.assign({}, CONSTANTS.SIGN_HEADERS_BASE);
        headerCa.timestamp = timestamp;
        let headerCaStr = JSON.stringify(headerCa);

        let s = path + bodyOrQuery + timestamp + headerCaStr;
        let hmac = crypto.createHmac('sha256', Buffer.from(token, 'utf-8')).update(s).digest('hex');
        let md5 = crypto.createHash('md5').update(hmac).digest('hex');

        return {md5: md5, headerCa: headerCa};
    }

    async getSignHeader(apiUrl, method, body, oldHeader, signToken, timestamp) {
        let header = {...oldHeader};
        const urlParsed = new url.URL(apiUrl);

        let bodyOrQuery = method.toLowerCase() === 'get'
            ? new URLSearchParams(body || urlParsed.searchParams).toString()
            : (body ? JSON.stringify(body) : '');

        const {
            md5: sign, headerCa
        } = await this.generateSignature(signToken, urlParsed.pathname, bodyOrQuery, timestamp);

        header['sign'] = sign;

        header = {...header, ...headerCa};

        return header;
    }

    async getGrantCode(token) {
        const data = {
            appCode: CONSTANTS.APP_CODE, token: token, type: 0
        };

        try {
            const response = await axios.post(CONSTANTS.GRANT_CODE_URL, data, {headers: CONSTANTS.REQUEST_HEADERS_BASE});

            if (response.data.status !== 0) {
                throw new Error(`获取认证码失败: ${JSON.stringify(response.data)}`);
            }

            return response.data.data.code;
        } catch (error) {
            console.error('获取认证码失败: ', error);
            throw error;
        }
    }

    async getCredResp(grantCode) {
        const data = {code: grantCode, kind: 1};

        try {
            const response = await axios.post(CONSTANTS.CRED_CODE_URL, data, {headers: CONSTANTS.REQUEST_HEADERS_BASE});

            if (response.data.code !== 0) {
                throw new Error(`获取cred失败：${JSON.stringify(response.data)}`);
            }

            return response.data.data;
        } catch (error) {
            console.error('获取cred失败：', error);
            throw error;
        }
    }

    async getBindingList(credResp) {
        const headers = CONSTANTS.REQUEST_HEADERS_BASE;
        headers.cred = credResp.cred;
        const timestamp = await this.getTimestamp();
        const signedHeaders = await this.getSignHeader(CONSTANTS.BINDING_URL, 'get', null, headers, credResp.token, timestamp);

        const response = await axios({
            method: 'get', url: CONSTANTS.BINDING_URL, headers: signedHeaders,
        });

        if (response.status !== 200) {
            throw new Error('Request failed with status code ' + response.status);
        }

        const responseData = response.data;
        for (let i of responseData.data.list) {
            if (i.appCode === 'arknights') {
                return i['bindingList'];
            }
        }

        throw new Error('未绑定明日方舟账号');
    }

    async doSignIn(uid, credResp, bindingList) {
        let headers = CONSTANTS.REQUEST_HEADERS_BASE;
        headers.cred = credResp.cred;
        let data = {uid, gameId: '0'};
        const timestamp = await this.getTimestamp();
        if (!bindingList.length) {
            throw new Error('未绑定明日方舟账号');
        }
        let drName, server;
        for (let i of bindingList) {
            if (i.uid === uid) {
                data.gameId = i['channelMasterId'];
                drName = 'Dr.' + i['nickName'];
                server = i['channelName'];
                break;
            }
        }
        if (!drName || !server) {
            throw new Error('未找到对应uid的明日方舟账号');
        }

        function parseSignResponse(signResponse, server, drName, uid) {
            let status, text
            if (signResponse.code === 0) {
                status = true;
                text = `[${server}] ${drName} UID:${uid} 签到成功\n`;
                let awards = signResponse.data['awards'] || [];
                if (!awards.length) {
                    throw new Error(`未能获取奖励列表，${JSON.stringify(signResponse)}`);
                }
                for (let award of awards) {
                    let resource = award['resource'] || {};
                    text += `奖励ID：${resource.id}\n`;
                    text += `签到奖励：${resource.name} × ${award.count}\n`;
                    text += `类型：${resource.type} ${award.type || '<Err>'}\n`;
                }
            } else {
                status = false;
                text = `[${server}] ${drName} UID:${uid} 签到失败\n请检查以下信息：\n${JSON.stringify(signResponse)}`;
            }
            return {status, text};
        }

        let signedHeaders = await this.getSignHeader(CONSTANTS.SIGN_URL, 'post', data, headers, credResp.token, timestamp);
        const response = await axios({
            method: 'post', url: CONSTANTS.SIGN_URL, headers: signedHeaders, data: data,
        });

        if (response.status !== 200) {
            throw new Error('Request failed with status code ' + response.status);
        }
        return parseSignResponse(response.data, server, drName, uid);
    }

    async runSignIn(uid, token) {
        const grantCode = await this.getGrantCode(token);
        const credResp = await this.getCredResp(grantCode);
        const bindingList = await this.getBindingList(credResp);
        return await this.doSignIn(uid, credResp, bindingList);
    }

    async getUserInfo(uid, token){
        const grantCode = await this.getGrantCode(token);
        const credResp = await this.getCredResp(grantCode);
        const headers = CONSTANTS.REQUEST_HEADERS_BASE;
        const timestamp = await this.getTimestamp();
        const body = {uid: uid};
        const signedHeaders = await this.getSignHeader(CONSTANTS.USER_INFO_URL, 'get', body, headers, credResp.token, timestamp);
        signedHeaders.cred = credResp.cred;
        const response = await axios({
            method: 'get', url: CONSTANTS.USER_INFO_URL, headers: signedHeaders, params: body
        });

        if (response.status !== 200) {
            throw new Error('Request failed with status code ' + response.status);
        }
        return response.data;
    }
}

export default Skland;
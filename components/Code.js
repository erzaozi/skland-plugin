import crypto from 'crypto';
import url from 'url';
import axios from 'axios';
import Config from './Config.js'
import Render from '../model/render.js'

const CONSTANTS = {
    APP_CODE: "4ca99fa6b56cc2ba",
    SIGN_URL: "https://zonai.skland.com/api/v1/game/attendance",
    BINDING_URL: "https://zonai.skland.com/api/v1/game/player/binding",
    GRANT_CODE_URL: "https://as.hypergryph.com/user/oauth2/v2/grant",
    CRED_CODE_URL: "https://zonai.skland.com/api/v1/user/auth/generate_cred_by_code",
    USER_INFO_URL: "https://zonai.skland.com/api/v1/game/player/info",
    CRED_CHECK_URL: "https://zonai.skland.com/api/v1/user/check",
    GACHA_URL: "https://ak.hypergryph.com/user/api/inquiry/gacha",
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
            try {
                const response = await axios.get(CONSTANTS.BINDING_URL);
                return response.data.timestamp;
            } catch (error) {
                return error.response.data.timestamp;
            }
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

        return { md5: md5, headerCa: headerCa };
    }

    async getSignHeader(apiUrl, method, body, oldHeader, signToken, timestamp) {
        let header = { ...oldHeader };
        const urlParsed = new url.URL(apiUrl);

        let bodyOrQuery = method.toLowerCase() === 'get'
            ? new URLSearchParams(body || urlParsed.searchParams).toString()
            : (body ? JSON.stringify(body) : '');

        const {
            md5: sign, headerCa
        } = await this.generateSignature(signToken, urlParsed.pathname, bodyOrQuery, timestamp);

        header['sign'] = sign;

        header = { ...header, ...headerCa };

        return header;
    }

    async getGrantCode(token) {
        const data = {
            appCode: CONSTANTS.APP_CODE, token: token, type: 0
        };

        try {
            const response = await axios.post(CONSTANTS.GRANT_CODE_URL, data, { headers: CONSTANTS.REQUEST_HEADERS_BASE });

            return response.data.data.code;
        } catch (error) {
            logger.error('获取认证码失败: ', error.response.data.msg);
            throw error;
        }
    }

    async getCredResp(grantCode) {
        const data = { code: grantCode, kind: 1 };

        try {
            const response = await axios.post(CONSTANTS.CRED_CODE_URL, data, { headers: CONSTANTS.REQUEST_HEADERS_BASE });

            return response.data.data;
        } catch (error) {
            logger.error('获取cred失败：', error.response.data.msg);
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
        let data = { uid, gameId: '0' };
        const timestamp = await this.getTimestamp();
        if (!bindingList.length) {
            return { status: false, text: `[未知] 未知\nUID：${uid} 签到失败\n未绑定明日方舟角色` };
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
            return {
                status: false,
                text: `[${server ? server : '未知'}] [${drName ? drName : '未知'}]\nUID：${uid} 签到失败\n未找到对应UID的明日方舟角色`
            };
        }

        function parseSignResponse(signResponse, server, drName, uid) {
            let status, text
            if (signResponse.code === 0) {
                status = true;
                text = `[${server}] ${drName}\nUID：${uid} 签到成功\n`;
                let awards = signResponse.data['awards'] || [];
                if (!awards.length) {
                    text += `未能获取奖励列表`
                }
                for (let award of awards) {
                    let resource = award['resource'] || {};
                    text += `奖励ID：${resource.id}\n`;
                    text += `签到奖励：${resource.name} × ${award.count}\n`;
                    text += `类型：${resource.type} ${award.type || '<Err>'}`;
                }
            } else if (signResponse.code === 10001) {
                status = true;
                text = `[${server}] ${drName}\nUID：${uid} 签到成功\n今日已经签到过了`;
            } else {
                status = false;
                text = `[${server}] ${drName}\nUID：${uid} 签到失败\n服务器返回以下信息：\n${signResponse.message}`;
            }
            return { status, text };
        }

        let signedHeaders = await this.getSignHeader(CONSTANTS.SIGN_URL, 'post', data, headers, credResp.token, timestamp);
        let response;
        try {
            response = await axios({
                method: 'post', url: CONSTANTS.SIGN_URL, headers: signedHeaders, data: data,
            });
        } catch (error) {
            if (error.response) {
                response = error.response;
            } else {
                return { status: false, text: `连接服务器失败：${error.message}` };
            }
        }
        return parseSignResponse(response.data, server, drName, uid);
    }

    async isAvailable(token) {
        try {
            const grantCode = await this.getGrantCode(token);
            const credResp = await this.getCredResp(grantCode);
            try {
                const bindingList = await this.getBindingList(credResp);
                return { status: true, grantCode, credResp, bindingList };
            } catch (error) {
                if (error.response.status === 405) {
                    return { status: false, message: "当前服务器IP被防火墙拦截，请更换服务器网络" };
                } else if (error.response.status === 401) {
                    return { status: false, message: error.response.data.message };
                }
                return { status: false, message: '该账号未绑定明日方舟角色' };
            }
        } catch (error) {
            return { status: false, message: 'Token已过期' };
        }
    }

    async getSanity(uid, credResp, bindingList, reImg = false) {
        const headers = CONSTANTS.REQUEST_HEADERS_BASE;
        headers.cred = credResp.cred;
        let body = { uid: uid };
        const timestamp = await this.getTimestamp();
        if (!bindingList.length) {
            if (reImg) {
                return `[未知] 未知\nUID：${uid} 获取实时数据失败\n未绑定明日方舟角色`;
            } else {
                return { isPush: false, text: `[未知] 未知\nUID：${uid} 获取实时数据失败\n未绑定明日方舟角色` };
            }
        }
        let drName, server;
        for (let i of bindingList) {
            if (i.uid === uid) {
                drName = 'Dr.' + i['nickName'];
                server = i['channelName'];
                break;
            }
        }
        if (!drName || !server) {
            if (reImg) {
                return `[${server ? server : '未知'}] [${drName ? drName : '未知'}]\nUID：${uid} 获取实时数据失败\n未找到对应UID的明日方舟角色`;
            } else {
                return { isPush: false, text: `[${server ? server : '未知'}] [${drName ? drName : '未知'}]\nUID：${uid} 获取实时数据失败\n未找到对应UID的明日方舟角色` };
            }
        }

        async function parseSanityResponse({ data: { currentTs, status: { ap } } }, drName, uid) {

            const currentTime = currentTs;
            const elapsed = Math.floor((currentTime - ap['lastApAddTime']) / 360);
            let currentAp = Math.min(ap['current'] + elapsed, ap.max);
            const key = `Yunzai:skland:pushed:${uid}`;
            let isPush = false;
            if (!await redis.get(key) && currentAp >= ap.max) {
                isPush = await redis.set(key, 'true');
            } else if (await redis.get(key) && currentAp < ap.max) {
                await redis.del(key);
            }

            let text = `${drName}（${uid}）你的理智已回满，当前为${currentAp} / ${ap.max}`;

            return { isPush, text };
        }

        let signedHeaders = await this.getSignHeader(CONSTANTS.USER_INFO_URL, 'get', body, headers, credResp.token, timestamp);
        let response;
        try {
            response = await axios({
                method: 'get', url: CONSTANTS.USER_INFO_URL, headers: signedHeaders, params: body,
            });
        } catch (error) {
            if (error.response) {
                response = error.response;
            } else {
                if (reImg) {
                    return `连接服务器失败：${error.message}`;
                } else {
                    return { isPush: false, text: `连接服务器失败：${error.message}` };
                }
            }
        }

        if (reImg) {
            return await Render.realTimeData(response.data, server, drName, uid);
        } else {
            return await parseSanityResponse(response.data, drName, uid);
        }
    }

    async getBuilding(uid, credResp, bindingList) {
        const headers = CONSTANTS.REQUEST_HEADERS_BASE;
        headers.cred = credResp.cred;
        let body = { uid: uid };
        const timestamp = await this.getTimestamp();
        if (!bindingList.length) {
            return `[未知] 未知\nUID：${uid} 获取实时数据失败\n未绑定明日方舟角色`;
        }
        let drName, server;
        for (let i of bindingList) {
            if (i.uid === uid) {
                drName = 'Dr.' + i['nickName'];
                server = i['channelName'];
                break;
            }
        }
        if (!drName || !server) {
            return `[${server ? server : '未知'}] [${drName ? drName : '未知'}]\nUID：${uid} 获取实时数据失败\n未找到对应UID的明日方舟角色`;
        }

        let signedHeaders = await this.getSignHeader(CONSTANTS.USER_INFO_URL, 'get', body, headers, credResp.token, timestamp);
        let response;
        try {
            response = await axios({
                method: 'get', url: CONSTANTS.USER_INFO_URL, headers: signedHeaders, params: body,
            });
        } catch (error) {
            if (error.response) {
                response = error.response;
            } else {
                return `连接服务器失败：${error.message}`;
            }
        }

        return await Render.buildingData(response.data, server, drName, uid);
    }

    async getUser(uid, credResp, bindingList) {
        const headers = CONSTANTS.REQUEST_HEADERS_BASE;
        headers.cred = credResp.cred;
        let body = { uid: uid };
        const timestamp = await this.getTimestamp();
        if (!bindingList.length) {
            return `[未知] 未知\nUID：${uid} 获取实时数据失败\n未绑定明日方舟角色`;
        }
        let drName, server;
        for (let i of bindingList) {
            if (i.uid === uid) {
                drName = 'Dr.' + i['nickName'];
                server = i['channelName'];
                break;
            }
        }
        if (!drName || !server) {
            return `[${server ? server : '未知'}] [${drName ? drName : '未知'}]\nUID：${uid} 获取实时数据失败\n未找到对应UID的明日方舟角色`;
        }

        let signedHeaders = await this.getSignHeader(CONSTANTS.USER_INFO_URL, 'get', body, headers, credResp.token, timestamp);
        let response;
        try {
            response = await axios({
                method: 'get', url: CONSTANTS.USER_INFO_URL, headers: signedHeaders, params: body,
            });
        } catch (error) {
            if (error.response) {
                response = error.response;
            } else {
                return `连接服务器失败：${error.message}`
            }
        }

        return await Render.userInfoData(response.data);
    }

    async getGacha(token, type = 1, reImg = false) {
        const list = []
        let response;
        try {
            response = await axios({
                method: 'get', url: CONSTANTS.GACHA_URL, params: { page: 1, token: token, channelId: type == 1 ? '' : '2' },
            });
            const data = response.data;
            if (data.code !== 0) {
                return `获取数据失败：${data.msg}${type == 1 ? '如果你是B服，请使用[#b服寻访记录]命令查看' : ''}`
            }
            for (let i of data.data.list) {
                for (let j of i.chars) {
                    list.push({ ts: i.ts, pool: i.pool, name: j.name, rarity: j.rarity, isNew: j.isNew })
                }
            }
            if (reImg) {
                return await Render.gachaData(list);
            } else {
                return list;
            }
        } catch (error) {
            return `连接服务器失败：${error.message}`
        }
    }
}

export default Skland;

import plugin from '../../../lib/plugins/plugin.js'
import CoreApi from '../model/coreApi.js'
import UserApi from '../model/userApi.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { pluginResources } from '../utils/path.js'
import _ from 'lodash'

export class skland extends plugin {
    constructor() {
        super({
            name: '森空岛实时数据',
            dsc: '森空岛实时数据',

            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 5000,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?实时数据$',
                    /** 执行方法 */
                    fnc: 'ap',
                },
            ]
        })
    }
    async ap(e) {
        let use_uid = await redis.get(`skland:defaultUid:${e.user_id}`)
        if (use_uid == null) {
            e.reply('未绑定森空岛账号，请先绑定后再试')
            return true
        }
        let cred = await UserApi.get_cred_by_uid(e.user_id, use_uid)
        let player_info = await CoreApi.get_user_info(use_uid, cred)
        const data = [
            {
                name: '理智',
                value: (await now_ap(player_info.data.status.ap)).ap,
                max: (await now_ap(player_info.data.status.ap)).max,
                info: (await now_ap(player_info.data.status.ap)).info,
                picname: 'Ny.png'
            },
            {
                name: '公开招募',
                value: (await now_recruit(player_info.data)).value,
                max: (await now_recruit(player_info.data)).max,
                info: (await now_recruit(player_info.data)).info,
                picname: 'q0.png'
            },
            {
                name: '公招刷新',
                value: '可刷新',
                max: null,
                info: '可进行公开招募标签刷新',
                picname: 'mW.png'
            },
            {
                name: '训练室',
                value: '空闲中',
                max: null,
                info: '',
                picname: 'Ls.png'
            },
            {
                name: '每周报酬合成玉',
                value: 1800,
                max: 1800,
                info: '5天3小时后刷新',
                picname: 'qe.png'
            },
            {
                name: '每日任务',
                value: 10,
                max: 10,
                info: '3小时51分钟后刷新',
                picname: 'dA.png'
            },
            {
                name: '每周任务',
                value: 12,
                max: 13,
                info: '5天3小时后刷新',
                picname: 'Cs.png'
            },
            {
                name: '数据增补仪',
                value: 0,
                max: 24,
                info: '10天3小时后刷新',
                picname: 'xL.png'
            },
            {
                name: '数据增补条',
                value: 0,
                max: 60,
                info: '10天3小时后刷新',
                picname: 'xL.png'
            }
        ]
        _.forEach(data, element => {
            element.img_path = `${pluginResources.replace(/\\/g, '/')}/ap/images/${element.picname}`
        })

        const base64 = await puppeteer.screenshot('real-time data', {
            saveId: 'Info',
            imgType: 'png',
            tplFile: `${pluginResources}/ap/ap.html`,
            pluginResources,
            header: '实　 时　 　　　 　数　 据',
            modelsGroup: data,
        })

        await e.reply(base64)
        return true
    }
}

async function now_ap(ap) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDifference = currentTimestamp - ap.lastApAddTime;
    const apToAdd = Math.floor(timeDifference / 360);
    const _ap = ap.current + apToAdd;
    // 计算距离恢复满理智还需要多少时间
    const timeToFullAp = (ap.max - _ap) * 360;
    let info
    if (timeToFullAp <= 0) {
        info = '理智已全部恢复'
    } else {
        const timeToFullApHour = Math.floor(timeToFullAp / 3600);
        const timeToFullApMinute = Math.floor((timeToFullAp % 3600) / 60);
        info = `${timeToFullApHour}小时${timeToFullApMinute}分钟后全部恢复`
    }
    return {
        ap: _ap <= ap.max ? _ap : ap.max,
        max: ap.max,
        info: info
    }
}

async function now_recruit(player_info) {
    const recruit = player_info.recruit;
    console.log(recruit);
    const recruit_task = recruit.map(item => item.state);
    const recruit_task_finish_count = recruit_task.filter(item => item === 2).length;
    let finishTs = -1;

    for (let i = 0; i < recruit.length; i++) {
        if (finishTs < recruit[i].finishTs) {
            finishTs = recruit[i].finishTs;
        }
    }

    let delta_hour = 0;
    let delta_minute = 0;

    if (finishTs !== -1) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDifference = finishTs - currentTimestamp;
        console.log(timeDifference);
        delta_hour = Math.floor(timeDifference / 3600);
        delta_minute = Math.floor((timeDifference % 3600) / 60);
    } else {
        delta_hour = 0;
        delta_minute = 0;
    }

    let info = '';
    if (recruit_task_finish_count === recruit.length) {
        info = '招募已全部完成'
    } else {
        info = `${delta_hour}小时${delta_minute}分钟后全部完成`
    }

    return {
        info: info,
        value: recruit.length - recruit_task_finish_count,
        max: recruit.length
    }
}
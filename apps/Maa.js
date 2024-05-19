import plugin from '../../../lib/plugins/plugin.js'
import Config from "../components/Config.js";
import MaaServer from "../components/MaaServer.js";
import crypto from 'crypto';
import { pluginResources } from '../model/path.js';

export class Maa extends plugin {
    constructor() {
        super({
            name: "Skland-Maa",
            event: "message",
            priority: 1009,
            rule: [
                {
                    reg: "^#?(MAA|Maa|maa).*$",
                    fnc: "maa"
                },
            ]
        })
    }

    async maa(e) {
        const maa_config = await Config.getConfig().maa_user_list
        const public_link = await Config.getConfig().maa_public_link

        const isConfigured = maa_config.some(entry => {
            const [userId] = entry.split(':');
            return userId == e.user_id;
        });

        if (!isConfigured) {
            if (public_link == '') {
                e.reply('主人未配置Maa公网连接地址，请联系机器人管理员');
                return true;
            }
            await e.reply('您当前未配置Maa设备，请先按照以下教程配置Maa设备')
            const maaStep = [
                { message: '打开Maa，找到设置-远程控制，填入以下信息' },
                { message: `获取任务端点：${public_link}/maa/getTask` },
                { message: `汇报任务端点：${public_link}/maa/reportStatus` },
                { message: `您当前的用户识别符为：${e.user_id}` },
                { message: segment.image(pluginResources + '/help/maa.png') },
                { message: '使用[#方舟设置maa + 设备标识符]命令绑定Maa设备' },
            ]
            await e.reply(Bot.makeForwardMsg(maaStep))
            return true
        }

        const data = maa_config.find(entry => {
            const [userId] = entry.split(':');
            return userId == e.user_id;
        });

        const taskName = e.msg.replace(/^#?(MAA|Maa|maa)/, '').trim();

        if (!MaaServer.taskList[data]) MaaServer.taskList[data] = []
        if (!MaaServer.reportList[data]) MaaServer.reportList[data] = []

        const uuid = generateUUID()

        let type = ''
        let snapshot = false
        let value = ''

        switch (taskName) {
            case '截图':
                type = 'CaptureImage'
                break;
            case '立即截图':
                type = 'CaptureImageNow'
                break;
            case '当前任务':
                type = 'HeartBeat'
                break;
            case '强制停止':
                type = 'StopTask'
                break;
            case '一键长草':
                type = 'LinkStart'
                snapshot = true
                break;
            case '基建换班':
                type = 'LinkStart-Base'
                snapshot = true
                break;
            case '开始唤醒':
                type = 'LinkStart-WakeUp'
                snapshot = true
                break;
            case '刷理智':
                type = 'LinkStart-Combat'
                snapshot = true
                break;
            case '自动公招':
                type = 'LinkStart-Recruiting'
                snapshot = true
                break;
            case '信用购物':
                type = 'LinkStart-Mall'
                snapshot = true
                break;
            case '领取奖励':
                type = 'LinkStart-Mission'
                snapshot = true
                break;
            case '自动肉鸽':
                type = 'LinkStart-AutoRoguelike'
                snapshot = true
                break;
            case '生息演算':
                type = 'LinkStart-ReclamationAlgorithm'
                snapshot = true
                break;
            case '单抽':
                type = 'Toolbox-GachaOnce'
                snapshot = true
                break;
            case '十连抽':
                type = 'Toolbox-GachaTenTimes'
                snapshot = true
                break;
            default:
                if (taskName.startsWith('切换连接地址')) {
                    const link = taskName.replace('切换连接地址', '').trim()
                    if (link == '') {
                        e.reply('请输入正确的连接地址')
                        return true;
                    }
                    type = 'Settings-ConnectAddress'
                    value = link
                } else if (taskName.startsWith('关卡选择')) {
                    const stage = taskName.replace('关卡选择', '').trim()
                    if (stage == '') {
                        e.reply('请输入正确的关卡名称')
                        return true;
                    }
                    type = 'Settings-Stage1'
                    value = stage
                } else {
                    e.reply(`请输入正确的任务名称\n使用[#方舟帮助]查看支持远程控制的功能`)
                    return true;
                }
        }

        MaaServer.taskList[data].push({
            "id": uuid,
            "type": type,
            "params": value
        })

        MaaServer.reportList[data].push({
            "task": uuid,
            "group_id": e.group_id || null,
            "self_id": e.self_id,
            "type": type,
            "value": value
        })

        if (snapshot) {
            const snapshot_uuid = generateUUID()
            MaaServer.taskList[data].push({
                "id": snapshot_uuid,
                "type": "CaptureImage",
            })
            MaaServer.reportList[data].push({
                "task": snapshot_uuid,
                "group_id": e.group_id || null,
                "self_id": e.self_id,
                "type": "CaptureImage"
            })
        }

        setTimeout(async () => {
            if (MaaServer.taskList[data] && MaaServer.taskList[data].length > 0) {
                await e.reply(`Maa未能及时取走任务，请检查Maa是否正常运行，检查用户标识符与设备标识符是否一致\n您的用户标识符：${e.user_id}\n您的设备标识符：${data.split(':')[1]}\n使用[#方舟设置maa + 设备标识符]命令重新绑定Maa设备`);
                delete MaaServer.taskList[data];
                delete MaaServer.reportList[data];
                return true;
            } else {
                if (snapshot) {
                    await e.reply(`Maa已经收到啦！${taskName}完成后会截图通知您哦~`);
                }
                return true;
            }
        }, 1000);

    }
}


function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
    );
}
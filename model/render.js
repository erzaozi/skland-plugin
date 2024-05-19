import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import fs from 'fs'
import { pluginResources } from './path.js'

class Render {
    constructor() {
    }

    async realTimeData({ data: { currentTs, status: { ap }, recruit, building: { hire, training }, charInfoMap, campaign: { reward }, routine: { daily, weekly }, tower: { reward: { higherItem, lowerItem, termTs } } } }, server, drName, uid) {
        const data = {}

        data.server = server
        data.drName = drName
        data.uid = uid

        // 理智
        const currentTime = currentTs;
        const elapsed = Math.floor((currentTime - ap['lastApAddTime']) / 360);
        let currentAp = Math.min(ap['current'] + elapsed, ap.max);
        data.ap = {}
        data.ap.now = currentAp
        data.ap.max = '/ ' + ap.max
        data.ap.tip = currentAp >= ap.max ? '理智已全部恢复' : `${await formatTime(ap['completeRecoveryTime'] - currentTime)}后全部恢复`

        // 公开招募
        let finishedTasks = recruit.filter(r => r['finishTs'] > currentTime).length;
        let lastFinishTs = recruit.reduce((max, r) => r['finishTs'] > currentTime && r['finishTs'] > max ? r['finishTs'] : max, -1);
        data.recruit = {}
        data.recruit.now = recruit.length - finishedTasks
        data.recruit.max = '/ ' + recruit.length
        data.recruit.tip = lastFinishTs === -1 ? '招募已全部完成' : `${await formatTime(lastFinishTs - currentTime)}后全部完成`

        // 公招刷新
        data.hire = {}
        if (hire) {
            if (hire['completeWorkTime'] - currentTime < 0) {
                hire['refreshCount'] = Math.min(hire['refreshCount'] + 1, 3);
            }

            if (hire['state'] === 0) {
                data.hire.now = '联络暂停'
            } else if (hire['state'] === 1 && hire['refreshCount'] < 3) {
                data.hire.now = '联络中'
            } else if (hire['state'] === 1 && hire['refreshCount'] === 3) {
                data.hire.now = '可刷新'
            } else {
                data.hire.now = '暂无数据'
            }

            if (hire['refreshCount'] < 3 && hire['completeWorkTime'] - currentTime > 0) {
                data.hire.tip = `${await formatTime(hire['completeWorkTime'] - currentTime)}后刷新次数`
            } else {
                data.hire.tip = ''
            }
            data.hire.max = ''
        } else {
            data.hire.now = '暂无数据'
            data.hire.max = ''
            data.hire.tip = ''
        }

        // 训练室
        data.training = {}
        if (training && training['trainee']) {
            if (training['remainSecs'] <= 0) {
                data.training.now = charInfoMap[training['trainee']['charId']]['name']
                data.training.max = ''
                data.training.tip = '设备空闲中';
            } else {
                data.training.now = charInfoMap[training['trainee']['charId']]['name']
                data.training.max = ''
                data.training.tip = `${await formatTime(training['remainSecs'])}后完成专精`;
            }
        } else {
            data.training.now = '空闲中'
            data.training.max = ''
            data.training.tip = ''
        }

        // 每周报酬合成玉
        const nextRewardTime = Math.floor((new Date(new Date().getTime() + ((1 - (new Date().getDay() === 0 ? 7 : new Date().getDay())) + 7) * 86400000)).setHours(4, 0, 0, 0) / 1000);
        data.reward = {}
        data.reward.now = reward['current']
        data.reward.max = '/ ' + reward.total
        data.reward.tip = `${await formatTime(nextRewardTime - currentTime)}后刷新`

        // 每日任务
        const nextDailyTaskTime = Math.floor((new Date().getHours() >= 4 ? new Date(new Date().setDate(new Date().getDate() + 1)).setHours(4, 0, 0, 0) : new Date().setHours(4, 0, 0, 0)) / 1000)
        data.daily = {}
        data.daily.now = daily['current']
        data.daily.max = '/ ' + daily.total
        data.daily.tip = `${await formatTime(nextDailyTaskTime - currentTime)}后刷新`;

        // 每周任务
        const nextWeeklyTaskTime = Math.floor((new Date(new Date().getTime() + ((1 - (new Date().getDay() === 0 ? 7 : new Date().getDay())) + 7) * 86400000)).setHours(4, 0, 0, 0) / 1000);
        data.weekly = {}
        data.weekly.now = weekly['current']
        data.weekly.max = '/ ' + weekly.total
        data.weekly.tip = `${await formatTime(nextWeeklyTaskTime - currentTime)}后刷新`;

        // 数据增补仪
        data.higherItem = {}
        data.higherItem.now = higherItem['current']
        data.higherItem.max = '/ ' + higherItem.total
        data.higherItem.tip = `${await formatTime(termTs - currentTime)}后刷新`;

        // 数据增补条
        data.lowerItem = {}
        data.lowerItem.now = lowerItem['current']
        data.lowerItem.max = '/ ' + lowerItem.total
        data.lowerItem.tip = `${await formatTime(termTs - currentTime)}后刷新`;

        const base64 = await puppeteer.screenshot('skland-plugin', {
            saveId: 'realTimeData',
            imgType: 'png',
            tplFile: `${pluginResources}/template/index.html`,
            pluginResources,
            data: data
        })

        return base64

        async function formatTime(timestamp) {
            const days = Math.floor(timestamp / 86400);
            const hours = Math.floor(timestamp / 3600) % 24;
            const minutes = Math.floor(timestamp / 60) % 60;

            return (days ? days + '天' : '') + (hours ? hours + '小时' : '') + minutes + '分钟';
        }
    }

    async buildingData({ data: { building: { tradings, manufactures, dormitories, meeting: { clue: { board } }, tiredChars, labor } } }, server, drName, uid) {
        const data = {}

        data.server = server
        data.drName = drName
        data.uid = uid

        // 订单进度
        data.tradings = {}
        data.tradings.now = tradings.reduce((acc, cur) => acc + cur.chars.length, 0)
        data.tradings.max = '/ ' + tradings.reduce((acc, cur) => acc + cur.stockLimit, 0)

        // 制造进度
        data.manufactures = {}
        data.manufactures.now = manufactures.reduce((acc, cur) => acc + cur.weight, 0)
        data.manufactures.max = '/ ' + manufactures.reduce((acc, cur) => acc + cur.capacity, 0)

        // 休息进度
        data.dormitories = {}
        data.dormitories.now = dormitories.reduce((acc, cur) => acc + cur.chars.reduce((acc, cur) => acc + (cur.ap === 8640000 ? 1 : 0), 0), 0)
        data.dormitories.max = '/ ' + dormitories.reduce((acc, cur) => acc + cur.chars.length, 0)

        // 线索进度
        data.board = {}
        data.board.now = board.length
        data.board.max = '/ 7'

        // 干员疲劳
        data.tiredChars = {}
        data.tiredChars.now = tiredChars.length
        data.tiredChars.max = ''

        // 无人机
        data.labor = {}
        data.labor.now = Math.min(Math.round((Date.now() / 1000 - labor.lastUpdateTime) / 360 + labor.value), labor.maxValue)
        data.labor.max = '/ ' + labor.maxValue

        const base64 = await puppeteer.screenshot('skland-plugin', {
            saveId: 'buildingData',
            imgType: 'png',
            tplFile: `${pluginResources}/template/build.html`,
            pluginResources,
            data: data
        })

        return base64

    }

    async userInfoData({ data: { status: { registerTs, name, mainStageProgress }, building: { furniture }, chars } }) {
        const data = {}

        // 注册时间
        data.registerTs = new Date(registerTs * 1000).toLocaleDateString().replace(/\//g, '-')

        // 游戏昵称
        data.name = 'Dr.' + name

        // 作战进度
        let levels = JSON.parse(fs.readFileSync(pluginResources + '/gamedata/levels.json', 'utf8'))
        data.mainStageProgress = levels[mainStageProgress] || ''

        // 家具保有
        data.furniture = furniture.total

        // 干员数量
        data.chars = chars.length

        const base64 = await puppeteer.screenshot('skland-plugin', {
            saveId: 'userInfoData',
            imgType: 'png',
            tplFile: `${pluginResources}/template/card.html`,
            pluginResources,
            data: data
        })

        return base64
    }

    async gachaData(list) {
        list.forEach(item => {
            item.ts = new Date(item.ts * 1000).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').replace(/(\d{4}-)/, '');
        })
        const base64 = await puppeteer.screenshot('skland-plugin', {
            saveId: 'gachaData',
            imgType: 'png',
            tplFile: `${pluginResources}/template/arkgacha.html`,
            pluginResources,
            datas: list
        })

        return base64
    }
}

export default new Render()
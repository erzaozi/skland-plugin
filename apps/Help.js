import plugin from '../../../lib/plugins/plugin.js';
import { pluginResources } from '../model/path.js'; import Render from '../components/Render.js';
import { style } from '../resources/help/imgs/config.js';
import _ from 'lodash';

export class Help extends plugin {
    constructor() {
        super({
            name: "Skland-帮助",
            event: "message",
            priority: 1008,
            rule: [
                {
                    reg: "^#?(skland|(明日)?方舟)帮助$",
                    fnc: "help"
                },
                {
                    reg: "^#?(skland|(明日)?方舟)绑定帮助$",
                    fnc: "bindHelp"
                }
            ]
        })
    }

    async help(e) {
        const helpCfg = {
            "themeSet": false,
            "title": "SKLAND-PLUGIN 帮助",
            // "subTitle": "Yunzai-Bot & skland-plugin",
            "subTitle": "SKLAND-PLUGIN HELP",
            "colWidth": 265,
            "theme": "all",
            "themeExclude": [
                "default"
            ],
            "colCount": 2,
            "bgBlur": true
        }
        const helpList = [
            {
                "group": "功能列表",
                "list": [
                    {
                        "icon": 17,
                        "title": "#方舟绑定",
                        "desc": "绑定账户Token"
                    },
                    {
                        "icon": 54,
                        "title": "#方舟解绑",
                        "desc": "解除绑定账户"
                    },
                    {
                        "icon": 86,
                        "title": "#方舟绑定帮助",
                        "desc": "绑定账户Token教程"
                    },
                    {
                        "icon": 14,
                        "title": "#方舟信息",
                        "desc": "获取用户卡片"
                    },
                    {
                        "icon": 17,
                        "title": "#方舟基建",
                        "desc": "查询已绑定所有账户基建数据"
                    },
                    {
                        "icon": 1,
                        "title": "#方舟签到",
                        "desc": "执行已绑定所有账户签到"
                    },
                    {
                        "icon": 5,
                        "title": "#方舟(开启|关闭)自动签到",
                        "desc": "每天四点自动执行所有账号签到"
                    },
                    {
                        "icon": 7,
                        "title": "#方舟理智",
                        "desc": "查询已绑定所有账户实时数据"
                    },
                    {
                        "icon": 11,
                        "title": "#方舟(开启|关闭)理智推送",
                        "desc": "理智值回满提醒"
                    },
                    {
                        "icon": 21,
                        "title": "#方舟设置maa",
                        "desc": "绑定Maa设备"
                    },
                    {
                        "icon": 3,
                        "title": "#方舟帮助",
                        "desc": "查看帮助面板"
                    },
                    {
                        "icon": 38,
                        "title": "#方舟更新",
                        "desc": "更新插件"
                    }
                ],
            },
            {
                "group": "Maa功能",
                "list": [
                    {
                        "icon": 24,
                        "title": "#maa截图",
                        "desc": "等待当前任务结束后截图"
                    },
                    {
                        "icon": 27,
                        "title": "#maa立即截图",
                        "desc": "立刻马上截图"
                    },
                    {
                        "icon": 30,
                        "title": "#maa当前任务",
                        "desc": "查看当前在执行什么任务"
                    },
                    {
                        "icon": 29,
                        "title": "#maa强制停止",
                        "desc": "停止当前进行的任务"
                    },
                    {
                        "icon": 28,
                        "title": "#maa一键长草",
                        "desc": "相当于点击LinkStart"
                    },
                    {
                        "icon": 26,
                        "title": "#maa基建换班",
                        "desc": "基建换班"
                    },
                    {
                        "icon": 25,
                        "title": "#maa开始唤醒",
                        "desc": "开始唤醒"
                    },
                    {
                        "icon": 23,
                        "title": "#maa刷理智",
                        "desc": "刷理智"
                    },
                    {
                        "icon": 11,
                        "title": "#maa自动公招",
                        "desc": "自动公招"
                    },
                    {
                        "icon": 31,
                        "title": "#maa信用购物",
                        "desc": "获取信用及购物"
                    },
                    {
                        "icon": 32,
                        "title": "#maa领取奖励",
                        "desc": "领取奖励"
                    },
                    {
                        "icon": 34,
                        "title": "#maa自动肉鸽",
                        "desc": "自动肉鸽"
                    },
                    {
                        "icon": 36,
                        "title": "#maa生息演算",
                        "desc": "生息演算"
                    },
                    {
                        "icon": 38,
                        "title": "#maa单抽",
                        "desc": "一次单抽（真实抽卡）"
                    },
                    {
                        "icon": 40,
                        "title": "#maa十连抽",
                        "desc": "一次十连抽（真实抽卡）"
                    },
                    {
                        "icon": 41,
                        "title": "#maa切换连接地址",
                        "desc": "切换连接地址"
                    },
                    {
                        "icon": 42,
                        "title": "#maa关卡选择",
                        "desc": "关卡选择"
                    },
                ],
            }
        ]
        let helpGroup = []
        _.forEach(helpList, (group) => {
            _.forEach(group.list, (help) => {
                let icon = help.icon * 1
                if (!icon) {
                    help.css = 'display:none'
                } else {
                    let x = (icon - 1) % 10
                    let y = (icon - x - 1) / 10
                    help.css = `background-position:-${x * 50}px -${y * 50}px`
                }
            })
            helpGroup.push(group)
        })

        let themeData = await this.getThemeData(helpCfg, helpCfg)
        return await Render.render('help/index', {
            helpCfg,
            helpGroup,
            ...themeData,
            element: 'default'
        }, { e, scale: 1.6 })
    }

    async bindHelp(e) {
        const helpStep = [
            { message: '1.浏览器打开 https://www.skland.com 登录账号' },
            { message: '2.再次打开 https://web-api.skland.com/account/info/hg' },
            { message: '3.复制 data.content 里的值（不带两边冒号）' },
            { message: segment.image(pluginResources + '/token/Token.png') },
            { message: '4.发送 #skland绑定xxxx 即可完成绑定(xxxx为上一步复制的值)' },
        ]
        await e.reply(Bot.makeForwardMsg(helpStep))
        return true
    }

    async getThemeData(diyStyle, sysStyle) {
        let resPath = '{{_res_path}}/help/imgs/'
        let helpConfig = _.extend({}, sysStyle, diyStyle)
        let colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
        let colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
        let width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
        let theme = {
            main: `${resPath}/main.png`,
            bg: `${resPath}/bg.jpg`,
            style: style
        }
        let themeStyle = theme.style || {}
        let ret = [`
          body{background-image:url(${theme.bg}) no-repeat;width:${width}px;}
          .container{background-image:url(${theme.main});width:${width}px;}
          .help-table .td,.help-table .th{width:${100 / colCount}%}
          `]
        let css = function (sel, css, key, def, fn) {
            let val = (function () {
                for (let idx in arguments) {
                    if (!_.isUndefined(arguments[idx])) {
                        return arguments[idx]
                    }
                }
            })(themeStyle[key], diyStyle[key], sysStyle[key], def)
            if (fn) {
                val = fn(val)
            }
            ret.push(`${sel}{${css}:${val}}`)
        }
        css('.help-title,.help-group', 'color', 'fontColor', '#ceb78b')
        css('.help-title,.help-group', 'text-shadow', 'fontShadow', 'none')
        css('.help-desc', 'color', 'descColor', '#eee')
        css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)')
        css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, (n) => diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`)
        css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)')
        css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, .2)')
        css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, .4)')
        return {
            style: `<style>${ret.join('\n')}</style>`,
            colCount
        }
    }
}

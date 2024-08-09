![skland-plugin](https://socialify.git.ci/erzaozi/skland-plugin/image?description=1&font=Raleway&forks=1&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto)

<img decoding="async" align=right src="resources/readme/girl.png" width="35%">

# SKLAND-PLUGIN

- 一个适用于 [Yunzai 系列机器人框架](https://github.com/yhArcadia/Yunzai-Bot-plugins-index) 的明日方舟辅助插件

- 无需提供账号密码，支持理智值查询和森空岛签到，理智值回满自动推送，支持 Maa 远程控制

- **使用中遇到问题请加 QQ 群咨询：[707331865](https://qm.qq.com/q/TXTIS9KhO2)**

> [!TIP]
> 其实这个插件去年 10 月就在写了，后来森空岛加了签名验证就咕咕咕了，这次只是填坑。[CikeyQi](https://github.com/CikeyQi) 在完成核心逻辑的开发后，与我一同完善了理智值推送，自动签到等功能，妈妈再也不用担心你理智溢出啦

## 安装插件

#### 1. 克隆仓库

```
git clone https://github.com/erzaozi/skland-plugin.git ./plugins/skland-plugin
```

> [!NOTE]
> 如果你的网络环境较差，无法连接到 Github，可以使用 [GitHub Proxy](https://mirror.ghproxy.com/) 提供的文件代理加速下载服务
>
> ```
> git clone https://mirror.ghproxy.com/https://github.com/erzaozi/skland-plugin.git ./plugins/skland-plugin
> ```

#### 2. 安装依赖

```
pnpm install --filter=skland-plugin
```

## 插件配置

> [!WARNING]
> 非常不建议手动修改配置文件，本插件已兼容 [Guoba-plugin](https://github.com/guoba-yunzai/guoba-plugin) ，请使用锅巴插件对配置项进行修改

## Maa 配置

插件启动后会在机器人服务器上启动一个 `HTTP` 服务器，用于与 Maa 通信，请查看控制台并找到如下内容

```
[TRSSYz][17:58:29.391][INFO] - 正在载入 SKLAND-PLUGIN
[TRSSYz][17:58:29.447][MARK] [Skland PLUGIN] 同步了 1 个用户信息
[TRSSYz][17:58:29.463][MARK] [MAA HTTP Server] 获取任务端点：http://localhost:25087/maa/getTask
[TRSSYz][17:58:29.464][MARK] [MAA HTTP Server] 汇报任务端点：http://localhost:25087/maa/reportStatus
[TRSSYz][17:58:29.577][INFO] - SKLAND-PLUGIN 载入成功
```

如果你没有修改默认端口，程序会监听 `25087` 端口。如果机器人和 Maa 在同一网络下，打开 Maa-`设置`-`远程控制`，填入控制台给的对应地址，用户标识符请填写您的 QQ 账号即可，启动机器人后输入 `#方舟设置maa + 设备标识符` 即可完成绑定

> [!NOTE]
> 如果你的机器人和 Maa 不在同一网络下或者想给群友一起用，请将 `localhost` 改成机器人服务器对应的公网 IP，并打开防火墙。建议打开 Guoba 将公网地址填入 `Maa服务公开地址` 配置项，方便群友自行配置。浏览器直接访问端点可看到 `[SKLAND-PLUGIN]MAA远程服务已运行0小时0分钟0秒` 字样或如下图样式界面，此方法可用于自行测试连通性

## 功能列表

请使用 `#方舟帮助` 获取完整帮助

- [x] 森空岛签到
- [x] 理智值提醒
- [x] 查询实时数据
- [x] 查询基建数据
- [x] 查询寻访记录
- [x] Maa 远程控制适配
- [x] Token 失效提醒并自动删除

> [!CAUTION]
> 如果机器人提示 `绑定失败！原因：该账号未绑定明日方舟角色` 且你已经非常确定自己已经绑定了角色。请先检查机器人服务器系统时间与北京时间是否相差过大，如果相差超过1分钟，请校准系统时间。如果仍然无法解决，请在配置项中打开 `使用网络时间戳` 选项即可解决

> [!IMPORTANT]
> 插件开发者因为自身情况无法完善更多信息获取（开发者中没人熟悉这个游戏，获取到的数据每个值不清楚什么意义，也不知道从哪获取资源文件），如果你有代码基础并乐意完善本插件功能，可以给我们提交 [Pull requests](https://github.com/erzaozi/skland-plugin/pulls)，与官方 API 接口交互相关代码在 `components/Code.js` 中

## 功能列表

<details><summary>点击展开</summary>

| 命令                   | 功能                          | 示例                                                                                             |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| #方舟绑定              | 绑定账户 Token                | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/bind.png)       |
| #方舟解绑              | 解除绑定账户                  | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/unbind.png)     |
| #方舟绑定帮助          | 绑定账户 Token 教程           | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/bindhelp.png)   |
| #方舟信息              | 获取用户卡片                  | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/info.png)       |
| #方舟基建              | 查询已绑定所有账户基建数据    | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/build.png)      |
| #寻访记录              | 查询账户寻访记录    | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/gacha.png)     |
| #方舟签到              | 执行已绑定所有账户签到        | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/signin.png)     |
| #方舟开启/关闭自动签到 | 每天四点自动执行所有账号签到  | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/autosignin.png) |
| #方舟理智              | 查询已绑定所有账户实时数据    | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/sanity.png)     |
| #方舟开启/关闭理智推送 | 理智值回满提醒                | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/autosanity.png) |
| #maa 十连抽            | 远程控制 maa 抽卡（真实抽卡） | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/card.png)       |
| #maa 立即截图          | 返回游戏当前截图              | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/maa.png)        |

</details>

## 支持与贡献

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力， 当然，你可以对我 [爱发电](https://afdian.net/a/sumoqi) 赞助，呜咪~❤️

有意见或者建议也欢迎提交 [Issues](https://github.com/erzaozi/skland-plugin/issues) 和 [Pull requests](https://github.com/erzaozi/skland-plugin/pulls)。

## 相关项目

- [nonebot-plugin-skland-arksign](https://github.com/GuGuMur/nonebot-plugin-skland-arksign)：用于每日早八定时签到森空岛明日方舟的 Nonebot 插件
- [amiyabot-arknights-hsyhhssyy-maa](https://github.com/hsyhhssyy/amiyabot-arknights-hsyhhssyy-maa)

## 许可证

本项目使用 [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) 作为开源许可证。

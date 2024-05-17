![skland-plugin](https://socialify.git.ci/erzaozi/skland-plugin/image?description=1&font=Raleway&forks=1&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto)

<img decoding="async" align=right src="resources/readme/girl.png" width="35%">

# SKLAND-PLUGIN

- 一个适用于 [Yunzai 系列机器人框架](https://github.com/yhArcadia/Yunzai-Bot-plugins-index) 的明日方舟辅助插件

- 无需提供账号密码，支持理智值查询和森空岛签到，理智值回满自动推送

- **使用中遇到问题请加 QQ 群咨询：[707331865](https://qm.qq.com/q/TXTIS9KhO2)**

> [!TIP]
> 其实这个插件去年 10 月就在写了，后来森空岛加了签名验证就咕咕咕了，这次只是填坑。[CikeyQi](https://github.com/CikeyQi)在完成核心逻辑的开发后，与我一同完善了理智值推送，自动签到等功能，妈妈再也不用担心你理智溢出啦

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

## 功能列表

请使用 `#skland帮助` 获取完整帮助

- [x] 森空岛签到
- [x] 理智值提醒
- [x] 查询实时数据
- [ ] 查询基建数据
- [x] Token 失效提醒并自动删除

> [!IMPORTANT]
> 插件开发者因为自身情况无法完善更多信息获取（开发者中没人熟悉这个游戏，获取到的数据每个值不清楚什么意义，也不知道从哪获取资源文件），如果你有代码基础并乐意完善本插件功能，可以给我们提交 [Pull requests](https://github.com/erzaozi/skland-plugin/pulls)，与官方 API 接口交互相关代码在 `components/Code.js` 中

## 功能列表

<details><summary>点击展开</summary>

| 命令                   | 功能                       | 示例                                                                                           |
| ---------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| #方舟绑定              | 绑定账户 Token             | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/bind.png)     |
| #方舟解绑              | 解除绑定账户               | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/unbind.png)   |
| ##方舟绑定帮助         | 绑定账户 Token 教程        | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/bindhelp.png) |
| #方舟信息              | 获取用户卡片               | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/info.png)   |
| #方舟签到              | 执行已绑定所有账户签到     | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/signin.png)   |
| #方舟开启/关闭自动签到 | 解除绑定账户               | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/uautosignin.png)   |
| #方舟理智              | 查询已绑定所有账户实时数据 | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/sanity.png)   |
| #方舟开启/关闭理智推送 | 理智值回满提醒             | ![renderings](https://cdn.jsdelivr.net/gh/erzaozi/skland-plugin/resources/readme/autosanity.png)   |


</details>

## 支持与贡献

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力， 当然，你可以对我 [爱发电](https://afdian.net/a/sumoqi) 赞助，呜咪~❤️

有意见或者建议也欢迎提交 [Issues](https://github.com/erzaozi/skland-plugin/issues) 和 [Pull requests](https://github.com/erzaozi/skland-plugin/pulls)。

## 相关项目

- [nonebot-plugin-skland-arksign](https://github.com/GuGuMur/nonebot-plugin-skland-arksign)：用于每日早八定时签到森空岛明日方舟的 Nonebot 插件

## 许可证

本项目使用 [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) 作为开源许可证。

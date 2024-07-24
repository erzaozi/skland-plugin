import Config from "./components/Config.js";
import lodash from "lodash";
import path from "path";
import { pluginRoot } from "./model/path.js";

export function supportGuoba() {
  return {
    pluginInfo: {
      name: 'skland-plugin',
      title: '明日方舟插件',
      author: ['@CikeyQi', '@erzaozi'],
      authorLink: ['https://github.com/CikeyQi', 'https://github.com/erzaozi'],
      link: 'https://github.com/CikeyQi/skland-plugin',
      isV3: true,
      isV2: false,
      showInMenu: true,
      description: '基于 Yunzai 的明日方舟每日签到和理智提醒插件',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'icon-park:game-ps',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: '#d19f56',
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      iconPath: path.join(pluginRoot, 'resources/readme/girl.png'),
    },
    configInfo: {
      schemas: [
        {
          component: "Divider",
          label: "Skland 推送配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "skland_auto_signin_lists",
          label: "自动签到配置",
          bottomHelpMessage: "自动签到列表",
          component: "GSubForm",
          componentProps: {
            multiple: true,
            schemas: [
              {
                field: "push_bot",
                label: "签到使用的机器人",
                component: "Input",
                required: true,
                componentProps: {
                  placeholder: '请输入机器人账号ID',
                },
              },
              {
                field: "push_group",
                label: "签到失败通知群",
                component: "Input",
                required: false,
                componentProps: {
                  placeholder: '请输入群号，不填默认私聊',
                },
              },
              {
                field: "push_user",
                label: "自动签到用户",
                component: "Input",
                required: true,
                componentProps: {
                  placeholder: '请输入用户账号ID',
                },
              },
            ],
          },
        },
        {
          field: "skland_auto_push_lists",
          label: "理智值推送配置",
          bottomHelpMessage: "理智推送列表",
          component: "GSubForm",
          componentProps: {
            multiple: true,
            schemas: [
              {
                field: "push_bot",
                label: "推送使用的机器人",
                component: "Input",
                required: true,
                componentProps: {
                  placeholder: '请输入机器人账号ID',
                },
              },
              {
                field: "push_group",
                label: "理智值推送群",
                component: "Input",
                required: false,
                componentProps: {
                  placeholder: '请输入群号，不填默认私聊',
                },
              },
              {
                field: "push_user",
                label: "理智值推送用户",
                component: "Input",
                required: true,
                componentProps: {
                  placeholder: '请输入用户账号ID',
                },
              },
            ],
          },
        },
        {
          component: "Divider",
          label: "Maa 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "maa_server_port",
          label: "Maa开放端口",
          bottomHelpMessage: "Maa的HTTP服务器开放端口",
          component: "InputNumber",
          componentProps: {
            placeholder: '请输入端口',
            min: 1,
            max: 65535,
            step: 1,
          },
        },
        {
          field: "maa_public_link",
          label: "Maa服务公开地址",
          bottomHelpMessage: "给群友绑定Maa功能用的，不需要加端点",
          component: "Input",
          componentProps: {
            placeholder: '请输入服务地址，例：http://39.156.66.10:25087',
          },
        },
        {
          field: "maa_user_lists",
          label: "Maa用户配置",
          bottomHelpMessage: "Maa用户列表",
          component: "GSubForm",
          componentProps: {
            multiple: true,
            schemas: [
              {
                field: "user",
                label: "用户标识符",
                component: "Input",
                required: true,
                componentProps: {
                  placeholder: '请输入用户唯一标识符',
                },
              },
              {
                field: "device",
                label: "设备标识符",
                component: "Input",
                required: false,
                componentProps: {
                  placeholder: '请输入设备唯一标识符',
                },
              },
            ],
          },
        },
        {
          component: "Divider",
          label: "Skland 签名配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "proxy_url",
          label: "代理地址",
          bottomHelpMessage: "当请求被防火墙拦截时可配置此项解决",
          component: "Input",
          componentProps: {
            placeholder: '请输入代理地址，例：http://127.0.0.1:7890',
          },
        },
        {
          field: "skland_use_web_timestamp",
          label: "使用网络时间戳",
          bottomHelpMessage: "签名时获取官网时间戳，而非本地时间戳",
          component: "Switch",
        },
        {
          field: "skland_timestamp_delay",
          label: "时间戳延迟",
          bottomHelpMessage: "时间戳延迟，单位为秒",
          component: "InputNumber",
          componentProps: {
            min: -100,
            max: 100,
            step: 1,
          },
        },
      ],
      getConfigData() {
        let config = Config.getConfig()
        config["skland_auto_signin_lists"] = [];
        config["skland_auto_signin_list"].forEach(user => {
          config["skland_auto_signin_lists"].push({ push_bot: user.split(":")[0], push_group: user.split(":")[1], push_user: user.split(":")[2] });
        });
        config["skland_auto_push_lists"] = [];
        config["skland_auto_push_list"].forEach(user => {
          config["skland_auto_push_lists"].push({ push_bot: user.split(":")[0], push_group: user.split(":")[1], push_user: user.split(":")[2] });
        })
        config["maa_user_lists"] = [];
        config["maa_user_list"].forEach(user => {
          config["maa_user_lists"].push({ user: user.split(":")[0], device: user.split(":")[1] });
        });
        return config
      },

      setConfigData(data, { Result }) {
        let config = {};
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value);
        }
        config = lodash.merge({}, Config.getConfig(), config);

        config["skland_auto_signin_list"] = [];
        config["skland_auto_signin_lists"].forEach(({ push_bot, push_group, push_user }) => {
          config["skland_auto_signin_list"].push(`${push_bot}:${push_group || "undefined"}:${push_user}`);
        });
        delete config["skland_auto_signin_lists"];

        config["skland_auto_push_list"] = [];
        config["skland_auto_push_lists"].forEach(({ push_bot, push_group, push_user }) => {
          config["skland_auto_push_list"].push(`${push_bot}:${push_group || "undefined"}:${push_user}`);
        });
        delete config["skland_auto_push_lists"];

        config["maa_user_list"] = [];
        config["maa_user_lists"].forEach(({ user, device }) => {
          config["maa_user_list"].push(`${user}:${device || "undefined"}`);
        });
        delete config["maa_user_lists"];

        Config.setConfig(config)
        return Result.ok({}, '保存成功~')
      },
    },
  }
}
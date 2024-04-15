import YAML from 'yaml'
import fs from 'fs'
import {pluginRoot} from '../model/path.js'
import Log from '../utils/logs.js'

class Config {
  getConfig() {
    try {
      return YAML.parse(
          fs.readFileSync(`${pluginRoot}/config/config/config.yaml`, 'utf-8')
      )
    } catch (err) {
      Log.e('读取config.yaml失败', err)
      return false
    }
  }

  getDefConfig() {
    try {
      return YAML.parse(
          fs.readFileSync(`${pluginRoot}/config/config_default.yaml`, 'utf-8')
      )
    } catch (err) {
      Log.e('读取config_default.yaml失败', err)
      return false
    }
  }

  setConfig(config_data) {
    try {
      fs.writeFileSync(
        `${pluginRoot}/config/config/config.yaml`,
        YAML.stringify(config_data),
      )
      return true
    } catch (err) {
      Log.e('写入config.yaml失败', err)
      return false
    }
  }
}

export default new Config()

import http from 'http';
import fs from 'fs';
import Config from './Config.js';
import { pluginResources } from '../model/path.js';

class MaaServer {
    constructor() {
        this.startTime = Date.now();
        this.initServer();
        this.taskList = {};
        this.reportList = {};
    }

    async initServer() {
        const server = http.createServer((req, res) => this.handleRequest(req, res));
        const port = Config.getConfig().maa_server_port;
        server.listen(port, () => {
            logger.mark(
                logger.blue('[MAA HTTP Server]') +
                ' 获取任务端点：' +
                logger.green(`http://localhost:${port}/maa/getTask`)
            )
            logger.mark(
                logger.blue('[MAA HTTP Server]') +
                ' 汇报任务端点：' +
                logger.green(`http://localhost:${port}/maa/reportStatus`)
            )
        });
    }

    async handleRequest(req, res) {
        if (req.method === 'POST' && req.headers['content-type'] === 'application/json; charset=utf-8') {
            const chunks = [];

            req.on('data', (chunk) => {
                chunks.push(chunk);
            });

            req.on('end', async () => {

                const body = JSON.parse(Buffer.concat(chunks).toString());

                if (req.url === '/maa/getTask') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });

                    const user_id = `${body.user}:${body.device}`

                    if (this.taskList[user_id]) {
                        res.end(JSON.stringify({ tasks: this.taskList[user_id] }))
                        delete this.taskList[user_id];
                    } else {
                        res.end('{}');
                    }

                } else if (req.url === '/maa/reportStatus') {
                    const user_id = `${body.user}:${body.device}`
                    if (this.reportList[user_id]) {
                        this.reportList[user_id].forEach(async (item, index) => {
                            if (item.task === body.task) {
                                body.group_id = item.group_id;
                                body.self_id = item.self_id;
                                body.type = item.type;
                                body.value = item.value;
                                await this.parsePayload(body)
                            }
                        });
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end('OK');
                } else {
                    this.sendStatus(res);
                }
            });
        } else {
            this.sendStatus(res);
        }
    }

    async sendStatus(response) {
        const currentTime = Date.now();
        const duration = (currentTime - this.startTime) / 1000;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        let filePath = pluginResources + '/maa/index.html';
        fs.readFile(filePath, (err, content) => {
            if (err) {
                response.end(`[SKLAND-PLUGIN]\nMAA远程服务已运行${hours}小时${minutes}分钟${seconds}秒`);
            } else {
                content = content.toString().replace('{startTime}', this.startTime)
                response.end(content)
            }
        });
    }

    async parsePayload(body) {
        let message
        switch (body.type) {
            case 'CaptureImageNow':
                message = segment.image('base64://' + body.payload)
                break;
            case 'CaptureImage':
                message = segment.image('base64://' + body.payload)
                break;
            case 'HeartBeat':
                const task = this.reportList[`${body.user}:${body.device}`].find(item => item.task == body.task);
                message = task ? '当前正在进行的任务是：' + task.type : '当前没有正在进行的任务';
                break;
            case 'StopTask':
                message = '当前正在进行的任务已停止'
                break;
            case 'Settings-Stage1':
                message = `切换关卡至 [${body.value}] 成功，请自行判断关卡是否合规`
                break;
            case 'Settings-ConnectAddress':
                message = `切换连接地址至 [${body.value}] 成功，请自行判断连接地址是否有效`
                break;
            default:
                message = body.payload
                break;
        }

        if (message == '') return

        if (body.group_id) {
            Bot[body.self_id].pickGroup(body.group_id).sendMsg([segment.at(body.user), ' Maa返回了以下内容\n', message])
        } else {
            Bot[body.self_id].pickUser(body.user).sendMsg(['Maa返回了以下内容\n', message])
        }
        this.reportList[`${body.user}:${body.device}`].splice(this.reportList[`${body.user}:${body.device}`].indexOf(body), 1)
    }
}

export default new MaaServer();
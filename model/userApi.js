class UserApi {
    /**
     * 通过user_id获取该用户的所有绑定cred
     * @param {string} user_id QQ号
     * @returns {object} 返回用户数据
     */
    async get_cred_by_user_id(user_id) {
        try {
            let allUser = await redis.get('skland:userCred')
            if (allUser == null) {
                allUser = {}
            } else {
                allUser = JSON.parse(allUser)
            }
            if (allUser[user_id] == undefined) {
                allUser[user_id] = []
            }
            let res = []
            for (let i = 0; i < allUser[user_id].length; i++) {
                res.push(allUser[user_id][i].cred)
            }
            return res
        } catch (error) {
            return []
        }
    }

    /**
     * 通过user_id获取该用户的uid
     * @param {string} user_id QQ号
     * @returns {object} 返回用户数据
     */
    async get_uid_by_user_id(user_id) {
        try {
            let allUser = await redis.get('skland:userCred')
            if (allUser == null) {
                allUser = {}
            } else {
                allUser = JSON.parse(allUser)
            }
            if (allUser[user_id] == undefined) {
                allUser[user_id] = []
            }
            let res = []
            for (let i = 0; i < allUser[user_id].length; i++) {
                let item = allUser[user_id][i]
                for (let j = 0; j < item.info.list.length; j++) {
                    let item2 = item.info.list[j]
                    for (let k = 0; k < item2.bindingList.length; k++) {
                        let item3 = item2.bindingList[k]
                        res.push(item3.uid)
                    }
                }
            }
            return res
        } catch (error) {
            return []
        }
    }

    /**
     * 通过uid获取该uid的cred
     * @param {string} cred 用户cred
     * @returns {object} 返回用户数据
     */
    async get_cred_by_uid(user_id, uid) {
        try {
            let allUser = await redis.get('skland:userCred')
            if (allUser == null) {
                allUser = {}
            } else {
                allUser = JSON.parse(allUser)
            }
            if (allUser[user_id] == undefined) {
                allUser[user_id] = []
            }
            let item = allUser[user_id]
            for (let j = 0; j < item.length; j++) {
                let item2 = item[j]
                for (let k = 0; k < item2.info.list.length; k++) {
                    let item3 = item2.info.list[k]
                    for (let l = 0; l < item3.bindingList.length; l++) {
                        let item4 = item3.bindingList[l]
                        if (item4.uid == uid) {
                            return item2.cred
                        }
                    }
                }

            }
            return null
        } catch (error) {
            return null
        }
    }

    /**
     * 通过uid获取该uid的昵称
     * @param {string} cred 用户cred
     * @returns {object} 返回用户数据
     */
    async get_nickname_by_uid(user_id, uid) {
        try {
            let allUser = await redis.get('skland:userCred')
            if (allUser == null) {
                allUser = {}
            } else {
                allUser = JSON.parse(allUser)
            }
            if (allUser[user_id] == undefined) {
                allUser[user_id] = []
            }
            let item = allUser[user_id]
            for (let j = 0; j < item.length; j++) {
                let item2 = item[j]
                for (let k = 0; k < item2.info.list.length; k++) {
                    let item3 = item2.info.list[k]
                    for (let l = 0; l < item3.bindingList.length; l++) {
                        let item4 = item3.bindingList[l]
                        if (item4.uid == uid) {
                            return item4.nickName
                        }
                    }
                }
            }
            return null
        } catch (error) {
            return null
        }
    }
}

export default new UserApi()
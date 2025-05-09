const axios = require('../../utils/http')
const {dictionary} = require('../../utils/zyfwwAPI')
const {POST_verification_code} = dictionary
const {catchFn} = require('../../public/public')

exports.getCodeController = async (ctx, next) => {
    await axios.post(POST_verification_code).then(result => {
        if (result.code) {
            console.log(11)
            return ctx.body = {
                code: result.code, msg: result.message, data: {
                    imgkey: '', img: ''
                }
            }
        }
        ctx.body = {
            code: 200,
            msg: result.message,
            data: result.data
        }

    }).catch(catchFn(ctx))

}



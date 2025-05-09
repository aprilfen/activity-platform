const baseURL = 'http://gz.chinavolunteer.mca.gov.cn/nvsidfapis/NVSIDF/restservices/webapi/'

const dictionary = {
    POST_verification_code: '/getImageCodeFortisWeb',
    POST_Login: '/LoginVolFortisWeb',
    POST_userInfo: '/getVolunteerInfoFortisWeb',
    POST_apply: '/volApplyTeamWeb',
    POST_group_info: '/queryMyTeamPageWeb',
}

for (const key in dictionary) {
    if (Object.hasOwnProperty.call(dictionary, key)) {
        dictionary[key] += '/query'
    }
}

module.exports = { baseURL, dictionary }
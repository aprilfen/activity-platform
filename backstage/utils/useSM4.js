const SM4 = require('./SM4')

const sm4Config = {
    iv: "longrise12345678",
    key: "p6fl4gN1brNfflKK",
    outType: 'base64'
}

const sm4Encrypt = function sm4Encrypt(msg) {//加密
    let msgString = msg;
    if (typeof (msgString) !== 'string') {
        plaintext = JSON.stringify(msg);
    }
    SM4.constructorInit(sm4Config);
    return SM4.encrypt(plaintext)
}
const sm4Decrypt = function sm4Decrypt(msg) { // 解密
    let msgString = msg;
    if (typeof (msgString) !== 'string') {
        plaintext = JSON.stringify(msg);
        SM4.constructorInit(sm4Config);
        return SM4.decrypt(plaintext)
    }else {
        SM4.constructorInit(sm4Config);
        return SM4.decrypt(msgString)
    }

}

module.exports = {
    sm4Encrypt,
    sm4Decrypt
}
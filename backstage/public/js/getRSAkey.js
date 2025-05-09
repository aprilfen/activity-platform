// const NodeRSA = require("node-rsa")
// var key = new NodeRSA({ b: 2048 }) //生成2048位的密钥
// // key.generateKeyPair(2048)
// key.setOptions({ encryptionScheme: 'pkcs1' }); //指定加密格式
//
// // 生成 公钥私钥，使用 pkcs8标准，pem格式
// var publicPem = key.exportKey('pkcs8-public-pem'); //公钥pkcs1对应公钥长度为188，pkcs8对应公钥长度为216
// var privatePem = key.exportKey('pkcs8-private-pem');
// // console.log('公钥:\n', publicPem);
// // console.log('私钥:\n', privatePem);
//
// const encryptRSA = function (message) {
//     var decrypt = new NodeRSA(publicPem, 'pkcs8-public-pem')
//     decrypt.setOptions({ encryptionScheme: 'pkcs1' })
//     return decrypt.encrypt(message, 'base64')
// }
//
// const decryptRSA = function (ciphertext) {
//     var decrypt = new NodeRSA(privatePem, 'pkcs8-private-pem')
//     decrypt.setOptions({ encryptionScheme: 'pkcs1' })
//     return decrypt.decrypt(ciphertext, 'utf8')
// }
//
// module.exports = {
//     publicKey: publicPem,
//     privateKey: privatePem,
//     encryptRSA,
//     decryptRSA
// }


const NodeRSA = require("node-rsa")
const forge   = require("node-forge")   // 新增，用于纯 JS 解密 PKCS#1 v1.5

var key = new NodeRSA({ b: 2048 }) //生成2048位的密钥
// key.generateKeyPair(2048)
key.setOptions({ encryptionScheme: 'pkcs1' }); //指定加密格式

// 生成 公钥私钥，使用 pkcs8标准，pem格式
var publicPem = key.exportKey('pkcs8-public-pem'); //公钥pkcs1对应公钥长度为188，pkcs8对应公钥长度为216
var privatePem = key.exportKey('pkcs8-private-pem');
// console.log('公钥:\n', publicPem);
// console.log('私钥:\n', privatePem);

const encryptRSA = function (message) {
    var decrypt = new NodeRSA(publicPem, 'pkcs8-public-pem')
    decrypt.setOptions({ encryptionScheme: 'pkcs1' })
    return decrypt.encrypt(message, 'base64')
}

const decryptRSA = function (ciphertext) {
    // 使用 node-forge 纯 JS 解密，绕过 OpenSSL 限制
    const privKey = forge.pki.privateKeyFromPem(privatePem)
    const encryptedBytes = forge.util.decode64(ciphertext)
    return privKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5')
}

module.exports = {
    publicKey: publicPem,
    privateKey: privatePem,
    encryptRSA,
    decryptRSA
}


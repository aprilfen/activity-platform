import JSEncrypt from "@/js_sdk/jsencrypt-Rsa/jsencrypt/jsencrypt.min.js"
import {
	Base64
} from '@/js_sdk/js-base64/base64.js'

// RSA加密
const RSAencrypt = async function(pas,publicKey) {
	//实例化jsEncrypt对象
	let jse = new JSEncrypt();
	//设置公钥
	// const publicKey = Base64.decode(publicKey)
	console.log(publicKey);
	// await getRsaKey()
	jse.setPublicKey(publicKey);
	return jse.encrypt(pas);
}
export default RSAencrypt

// import '@/public/forge.all.min.js';

// /**
//  * RSA-OAEP(SHA-256) 加密
//  * @param {string} pas       明文密码
//  * @param {string} publicKey 后端返回的 PKCS#8 PEM 公钥
//  * @returns {string}         Base64 密文
//  */
// const RSAencrypt = function(pas, publicKey) {
//   // 1. 从 PEM 构造公钥
//   const pubKey = window.forge.pki.publicKeyFromPem(publicKey);

//   // 2. 用 OAEP + SHA-256 加密
//   const encryptedBytes = pubKey.encrypt(pas, 'RSA-OAEP', {
//     md: window.forge.md.sha256.create(),
//     mgf1: { md: window.forge.md.sha1.create() }
//   });

//   // 3. 返回 Base64
//   return window.forge.util.encode64(encryptedBytes);
// };

// export default RSAencrypt;
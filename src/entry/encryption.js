import CryptoJS from 'crypto-js'

export class EncryptionUtil {
  /**
   * 对给定的数据进行AES加密。
   * @param {string} data 待加密的字符串数据。
   * @returns {string} 加密后的字符串。
   */
  static encrypted(data) {
    try {
      const encryptedText = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
      return encryptedText
    } catch (error) {
      console.error('加密失败:', error)
      throw error
    }
  }

  /**
   * 解密给定的AES加密数据。
   * @param {string} encryptedData 已加密的Base64字符串数据，前缀包含IV。
   * @returns {string} 解密后的原始字符串数据。
   */
  static decrypted(encryptedData) {
    try {
      const decryptedText = CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Utf8)
      return decryptedText
    } catch (error) {
      console.error('解密失败:', error)
      throw error
    }
  }
}

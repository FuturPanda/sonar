import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

const secret = "sonar";

export const createNewJWToken = (userEmail: string) => {
  const rawToken = {
    email: userEmail,
    iat: Date.now(),
  };
  return jwt.sign(rawToken, secret);
};

export const verifyToken = (token: string) => {
  let isValid = jwt.verify(token, secret);
  return isValid;
};

export const encrypt = (text: string) => {
  return CryptoJS.AES.encrypt(text, secret).toString();
};

export const decrypt = (ciphertext: string) => {
  var bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

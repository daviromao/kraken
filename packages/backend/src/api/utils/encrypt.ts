import CryptoJs from 'crypto-js';
import config from '../../config';

export const encrypt = (data: string) => {
  return CryptoJs.AES.encrypt(data, config.SECRET_PASSPHRASE).toString();
};

export const decrypt = (data: string) => {
  return CryptoJs.AES.decrypt(data, config.SECRET_PASSPHRASE).toString(CryptoJs.enc.Utf8);
};

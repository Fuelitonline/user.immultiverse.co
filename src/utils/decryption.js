import CryptoJS from 'crypto-js';

// Decrypting the response data
const decryptResponseData = (encryptedData) => {
    if(encryptedData){
        const secretKey = import.meta.env.VITE_SECRET_KEY || 'default-secret'; // Make sure this matches the server's key
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedData); // Parse the decrypted JSON data
    }
   else{
    return null
   }


};

export default decryptResponseData

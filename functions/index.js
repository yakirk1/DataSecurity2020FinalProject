const firebaseConfig = {
    apiKey: "AIzaSyDDNsBN9kXNqMAs-dMHBgKrkY_P9xSh-po",
    authDomain: "hideyourtext.firebaseapp.com",
    databaseURL: "https://hideyourtext.firebaseio.com",
    projectId: "hideyourtext",
    storageBucket: "hideyourtext.appspot.com",
    messagingSenderId: "805739032866",
    appId: "1:805739032866:web:77de39a2d0d367daf4f57b",
    measurementId: "G-EQE4XDWZ07"
  };
  const functions = require('firebase-functions');
  const firebase = require("firebase");
  const admin = require('firebase-admin');
  firebase.initializeApp(firebaseConfig);
  admin.initializeApp();
  const bigInt = require('big-integer');
  const NodeRSA = require('node-rsa');


class RSA {
  static randomPrime(bits) {
    const min = bigInt.one.shiftLeft(bits - 1);
    const max = bigInt.one.shiftLeft(bits).prev();
    
    while (true) {
      let p = bigInt.randBetween(min, max);
      if (p.isProbablePrime(256)) {
        return p;
      } 
    }
  }

  static generate(keysize) {
    const e = bigInt(65537);
    let p;
    let q;
    let totient;
  
    do {
      p = this.randomPrime(keysize / 2);
      q = this.randomPrime(keysize / 2);
      totient = bigInt.lcm(
        p.prev(),
        q.prev()
      );
    } while (bigInt.gcd(e, totient).notEquals(1) || p.minus(q).abs().shiftRight(keysize / 2 - 100).isZero());

    return {
      e, 
      n: p.multiply(q),
      d: e.modInv(totient),
    };
  }

  static encrypt(encodedMsg, n, e) {
    return bigInt(encodedMsg).modPow(e, n);
  }

  static decrypt(encryptedMsg, d, n) {
    return bigInt(encryptedMsg).modPow(d, n); 
  }
  static closeEnough(dataRSA,RSA){
    var count=0;
    for(var i=0;i<RSA.length;i++){
      if(dataRSA[i]!=RSA[i])
        count++
    }
    if(count<3)
      return true;
    return false;
  }
  static encode(str) {
    const codes = str
      .split('')
      .map(i => i.charCodeAt())
      .join('');

    return bigInt(codes);
  }

  static decode(code) {
    const stringified = code.toString();
    let string = '';

    for (let i = 0; i < stringified.length; i += 2) {
      let num = Number(stringified.substr(i, 2));
      
      if (num <= 30) {
        string += String.fromCharCode(Number(stringified.substr(i, 3)));
        i++;
      } else {
        string += String.fromCharCode(num);
      }
    }

    return string;
  }
}


exports.myRSA_Encrypt= functions.https.onCall((data,context)=>{
   /* const keys = RSA.generate(250);
    const encoded_message = RSA.encode(data.text);
    const encrypted_message = RSA.encrypt(encoded_message, keys.n, keys.e);
    
    const decrypted_message = RSA.decrypt(encrypted_message, keys.d, keys.n);
    const decoded_message = RSA.decode(decrypted_message);
    return {data:encrypted_message.toString(),keys:keys,decodedData:decoded_message};
*/
  
  const key = new NodeRSA({b: 512});
  //return key;
  /*
  
  const encrypted = key.encrypt(data.text, 'base64');
  const decrypted = key.decrypt(encrypted, 'utf8');
  

  return new Promise((resolve, reject) => {
    
      return resolve({data:encrypted,decodedData:decrypted,keys:key});
  });
*/
const encrypted = key.encrypt(data.text, 'base64');
const decrypted = key.decrypt(encrypted, 'utf8');

return {data:encrypted,decodedData:decrypted};
});


exports.addImage = functions.https.onCall((data, context) => {
  return admin.firestore().collection('images').add({
    rsa: data.RSA,
    decodedData:data.decodedData
}).then(() => {
    return 'image added';
}).catch(() => {
    throw new functions.https.HttpsError(
        'internal',
        'image not added'
    );
});
});



exports.myRSA_Decrypt= functions.https.onCall((data,context)=>{

  const ref = firebase.firestore().collection('images');
  var myImage=["f"];
  ref.onSnapshot(snapshot => {
    return myImage;
    snapshot.forEach(doc => {
        if(RSA.closeEnough(doc.data().rsa,data.msg)){
          myImage.push({...doc.data(), id: doc.id});
        }
    });
    if(myImage.length==0){
      return "No matching results,please encrypt a file with our website.";
    }
    else{
      return myImage;
    }

    
  })
});

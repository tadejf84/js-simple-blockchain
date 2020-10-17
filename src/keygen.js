const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Generate key pair
const key = ec.genKeyPair();

// Generate public key
const publicKey = key.getPublic('hex');
console.log(`Your public key is: ${publicKey}`);

// Generate private key
const privateKey = key.getPrivate('hex');
console.log(`Your private key is: ${privateKey}`);



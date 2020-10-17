const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Generate key pair
const key = ec.genKeyPair();

// Get public key
const publicKey = key.getPublic('hex');
console.log(`Your public key is: ${publicKey}`);

// Get private key
const privateKey = key.getPrivate('hex');
console.log(`Your private key is: ${privateKey}`);



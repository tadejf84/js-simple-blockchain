const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Generate key from my private key with Elliptic
const myPrivateKey = '42f4aab0db99dbe4d42f28c35eea6ea22aa1c0170c5d569e665d92147710ef48';
const myKey = ec.keyFromPrivate(myPrivateKey);
const myWalletAddress = myKey.getPublic('hex');

// Create new blockchain
const blockchain = new Blockchain();

// Transactions
const tx1 = new Transaction(myWalletAddress, 'public key of recipient goes here', 100);
tx1.signTransaction(myKey);
blockchain.addTransaction(tx1);

blockchain.minePendingTransactions(myWalletAddress);
console.log(blockchain);

console.log(blockchain.getBalanceOfAddress(myWalletAddress));

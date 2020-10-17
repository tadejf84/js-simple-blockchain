const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Generate key from my private key with Elliptic
const myPrivateKey = '42f4aab0db99dbe4d42f28c35eea6ea22aa1c0170c5d569e665d92147710ef48';
const myKey = ec.keyFromPrivate(myPrivateKey);
const myWalletAddress = myKey.getPublic('hex');

// Public keys of two other wallets
const walletAddress1 = '048485b6a18411399f202cd876dfdfc09f514eddcbd7b46f3e79d886a69a725f0f9dad1f67b5ba42e6fc9fff948a419067309007f9cc97a6b1d2bdd4a5cb366683';
const walletAddress2 = '047d6f3d9b29283c5f1437ec75efefd778fa06c3d9ce16049d670de5044d77a3f108ddbd7c3f1b7e1b92d1b10c325a2d0647b4b9b55f1d3962a1d709b5cb92d020';

// Create new blockchain
const blockchain = new Blockchain();

// Transactions
const tx1 = new Transaction(myWalletAddress, walletAddress1, 50);
tx1.signTransaction(myKey);
blockchain.addTransaction(tx1);

const tx2 = new Transaction(myWalletAddress, walletAddress2, 30);
tx2.signTransaction(myKey);
blockchain.addTransaction(tx2);

// Mine a block
blockchain.minePendingTransactions(myWalletAddress);
console.log(blockchain);

// Mine another block
blockchain.minePendingTransactions(myWalletAddress);

// Show my balance
console.log(`My balance is: ${blockchain.getBalanceOfAddress(myWalletAddress)}`);

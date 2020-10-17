const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


/**
 * Class Transaction
 * 
 */
class Transaction {

    /**
     * @constructor
     * 
     * @param {string} fromAddress 
     * @param {string} toAddress 
     * @param {number} amount 
     */
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;             // Payer's wallet address - public key
        this.toAddress = toAddress;                 // Payee's wallet address - public key
        this.amount = amount;                       // Transaction amount        
    }

    /**
     * Calculate SHA256 hash of the transaction
     * 
     * @returns {string} hash
     */
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    /**
     * Sign transaction
     * 
     * @param {object} keys
     */
    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) throw new Error('You cannot sign transactions from other wallets!');
        const hashTx = this.calculateHash();
        const signature = signingKey.sign(hashTx, 'base64');
        this.signature = signature.toDER('hex');
    }

    /**
     * Check if transaction is valid
     * 
     * @returns {boolean}
     */
    isValid() {

        // All miner rewards transactions are valid
        if(this.fromAddress === null) return true;

        // If signature is missing, throw an error
        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        // Verify that the transaction has been signed by the public key
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}


/**
 * Class Block
 * Create a single block in the blockchain
 * 
 */
class Block {

    /**
     * @constructor
     * 
     * @param {object} transactions
     * @param {string} prevHash 
     */
    constructor(transactions, prevHash = null) {
        this.timestamp = Date.now();                // Block timestamp
        this.transactions = transactions;           // All transactions in a block
        this.prevHash = prevHash;                   // Previous block hash
        this.hash = this.calculateHash();           // Current block hash
        this.nonce = 0;
    }

    /**
     * Calculate hash
     * 
     * @returns {string} hash
     */
    calculateHash() {
        return SHA256(this.index + this.timestamp + this.prevHash + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    /**
     * Add calculation difficulty - mining
     * Recalculate hash until number of zeros at the beginning of the hash matches the set difficulty
     * 
     * @param {number} difficulty 
     */
    mineBlock(difficulty) {
        const zeroString = Array(difficulty).fill("0").join("");

        while(this.hash.substring(0, difficulty) !== zeroString) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`Block mined: ${this.hash}`);
    }

    /**
     * Check if all transactions are valid
     * 
     * @returns {boolean}
     */
    hasValidTransactions() {

        for (const tx of this.transactions) {
            if(!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}


/**
 * Blockchain Class
 * Create an array (chain) of blocks
 * 
 */
class Blockchain {

    /**
     * @constructor
     * 
     */
    constructor() {
        this.chain = [this.createGenesisBlock()];   // Blockchain array
        this.difficulty = 4;                        // Difficulty setting for mining
        this.pendingTransactions = [];              // Pending transactions
        this.miningReward = 100;                    // Reward for mining a single block
    }

    /**
     * Create genesis block - first block in the chain
     * 
     * @returns {object} block
     */
    createGenesisBlock() {
        return new Block("Genesis block");
    }

    /**
     * Get last block in the chain
     * 
     * @returns {object} block
     */
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Mine pending transactions and add new block to the chain
     * 
     * @param {string} mining reward address
     */
    minePendingTransactions(miningRewardAddress) {
        const block =  new Block(this.pendingTransactions);
        block.prevHash = this.getLastBlock().hash;
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    /**
     * Create new transaction
     * 
     * @param {object} transaction 
     */
    addTransaction(transaction) {
        
        // Check that to and from address exist for every transactions
        if( !transaction.fromAddress || !transaction.toAddress ) throw new Error('Transaction must have from and to address!');

        // Check that the transaction is valid
        if(!transaction.isValid()) throw new Error('Cannot add invalid transaction to the chain!');

        // Add to pending transactions array
        this.pendingTransactions.push(transaction);
    }

    /**
     * Check balance of a specific address - wallet
     * 
     * @param {string} address 
     * 
     * @returns {number} balance
     */
    getBalanceOfAddress(address) {
        let balance = 0;

        for(const block of this.chain) {
            for(const trans of block.transactions) {

                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if(trans.toAddress === address) {
                    balance += trans.amount;
                }

            }
        }

        return balance;
    }

    /**
     * Check the integrity of the blockchain
     * 
     * @returns {boolean}
     */
    isChainValid() {

        for(let i = 1; i < this.chain.length; i++) {
            const curBlock = this.chain[i],
                  prevBlock = this.chain[i - 1];

            // Check if all transactions of the current block are valid
            if(!curBlock.hasValidTransactions()) return false;

            // Check if hash of the current block is still valid
            if(curBlock.hash !== curBlock.calculateHash()) return false;

            // Check if the previous hash is set properly
            if(curBlock.prevHash !== prevBlock.hash) return false; 
        }

        return true;
    }
}


// Export Blockchain class
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
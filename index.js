const SHA256 = require('crypto-js/sha256');

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
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
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
        this.timestamp = Date.now();
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
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
        console.log(`Block mined: ${this.hash}` );
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
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 100;
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
     * @param {string} fromAddress 
     * @param {string} toAddress 
     * @param {number} amount 
     */
    createTransaction(fromAddress, toAddress, amount) {
        const transaction = new Transaction(fromAddress, toAddress, amount);
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

            // Check if hash of the current block is still valid
            if(curBlock.hash !== curBlock.calculateHash()) return false;

            // Check if the previous hash is set properly
            if(curBlock.prevHash !== prevBlock.hash) return false; 
        }

        return true;
    }
}


const blockchain = new Blockchain();
blockchain.createTransaction('address1', 'address2', 100);
blockchain.createTransaction('address2', 'address1', 50);
blockchain.createTransaction('address3', 'address1', 70);
blockchain.minePendingTransactions('miner-address');
console.log(blockchain);

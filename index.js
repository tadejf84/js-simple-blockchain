const SHA256 = require('crypto-js/sha256');

/*
* create a single block in the blockchain
* @param index - position of the block in the chain (in the array)
* @param timestamp - time of block creation 
* @param data - data that the block holds
* @param prevHash - hash of the previous block, link to the previous block in the chain
*/
class Block {

    constructor(timestamp, data, hash, prevHash) {
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.generateHash();
        this.nonce = 0; // neccesary to change the content of the block to generate a new hash
    }

    // generate a hash for the block
    generateHash() {
        return SHA256(this.index + this.timestamp + this.prevHash + JSON.stringify(this.data) + this.nonce).toString();
    }

    // adding calculation difficulty - mining
    mineBlock(difficulty) {
        const zeroArr = Array(difficulty).fill("0").join("");
        while(this.hash.substring(0, difficulty) !== zeroArr) {
            this.nonce++;
            this.hash = this.generateHash();
        }
        console.log(`Block mined: ${this.hash}` );
    }
}


/*
* blockchain class
* create an array of blocks
*/
class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
    }

    // the first block in the chain is called "genesis block"
    // has to be created manually
    createGenesisBlock() {
        return new Block(1575829001450,"Genesis block", "null");
    }

    getLastBlockInChain() {
        return this.chain[this.chain.length - 1];
    }

    addNewBlock(newBlock) {
        newBlock.prevHash = this.getLastBlockInChain().hash;
        newBlock.timestamp = Date.now();
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock); // push the block in the chain        
    }

    // check the integrity of the blockchain
    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const   curBlock = this.chain[i],
                    prevBlock = this.chain[i - 1];

            if(curBlock.hash !== curBlock.generateHash()) return false;
            if(curBlock.prevHash !== prevBlock.hash) return false; 
        }
        return true;
    }
}


let blockchain = new Blockchain();
blockchain.addNewBlock( new Block({ "amount": 4, "currency": "USD" }) );
console.log(blockchain);
blockchain.addNewBlock( new Block({ "amount": 15, "currency": "EUR" }) );
console.log(blockchain);

const SHA256 = require('crypto-js/sha256');

/*
* create a single block in the blockchain
* @param index - position of the block in the chain (in the array)
* @param timestamp - time of block creation 
* @param data - data that the block holds
* @param prevHash - hash of the previous block, link to the previous block in the chain
*/
class Block {

    constructor(index,  data, prevHash) {
        this.index = index;
        this.timestamp = Date.now();
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.generateHash();
    }

    // generate a hash for the block
    generateHash() {
        return SHA256(this.index + this.timestamp + this.prevHash + JSON.stringify(this.data)).toString();
    }
}


/*
* blockchain class
* create an array of blocks
*/
class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    // the first block in the chain is called "genesis block"
    // has to be created manually
    createGenesisBlock() {
        return new Block(0, "Genesis block", "null");
    }

    getLastBlockInChain() {
        return this.chain[this.chain.length - 1];
    }

    addNewBlock(newBlockData) {
        const   newBlockIndex = (this.getLastBlockInChain().index) + 1, 
                newBlockPrevHash = this.getLastBlockInChain().hash, // link to previously created block
                newBlock = new Block(newBlockIndex, newBlockData, newBlockPrevHash); // instantiate new block
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
blockchain.addNewBlock({ "amount": 4, "currency": "USD" });
blockchain.addNewBlock({ "amount": 15, "currency": "EUR" });

console.log(blockchain);
console.log( "is chain valid: " + blockchain.isChainValid());
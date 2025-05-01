const assert = require('assert');
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const eF = require('./Build/ElectionFact.json');

console.log('Starting deployment process...');

const provider = new HDWalletProvider(
	'785fcd8ca068581e066c4dcc357e664c8ddb326ba55733f386fc6aa6b4bf7e4e',
	'https://sepolia.infura.io/v3/b04a4ab5727e47259aaf4f4cc1d97189'
);

console.log('Provider created, initializing Web3...');
const web3 = new Web3(provider);

const deploy = async () => {
	try {
		console.log('Getting accounts...');
		const accounts = await web3.eth.getAccounts();
		console.log('Deploying from account:', accounts[0]);

		console.log('Creating contract instance...');
		const contract = new web3.eth.Contract(eF.abi);
		
		console.log('Deploying contract...');
		const result = await contract
			.deploy({ 
				data: '0x' + eF.evm.bytecode.object 
			})
			.send({ 
				from: accounts[0],
				gas: '3000000',
				gasPrice: web3.utils.toWei('2', 'gwei')
			});

		console.log('Contract successfully deployed!');
		console.log('Contract address:', result.options.address);
		
		// Save the address to a file for later use
		const fs = require('fs');
		fs.writeFileSync('contract-address.txt', result.options.address);
		console.log('Contract address saved to contract-address.txt');
		
		process.exit(0);
	} catch (error) {
		console.error('Deployment failed!');
		console.error('Error details:', error);
		process.exit(1);
	}
};

deploy();

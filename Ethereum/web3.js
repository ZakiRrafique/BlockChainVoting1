import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
	// We are in the browser and MetaMask is running
	web3 = new Web3(window.ethereum);
} else {
	// We are on the server *OR* the user is not running MetaMask
	const provider = new Web3.providers.HttpProvider(
		'https://sepolia.infura.io/v3/b04a4ab5727e47259aaf4f4cc1d97189'
	);
	web3 = new Web3(provider);
}

export const getGasPrice = async () => {
	try {
		// Get current base fee from the network
		const block = await web3.eth.getBlock('latest');
		const baseFee = block.baseFeePerGas;
		
		// Calculate maxFeePerGas and maxPriorityFeePerGas for EIP-1559
		const maxPriorityFeePerGas = web3.utils.toWei('1.5', 'gwei'); // 1.5 Gwei priority fee
		const maxFeePerGas = web3.utils.toBN(baseFee)
			.mul(web3.utils.toBN(2)) // Double the base fee
			.add(web3.utils.toBN(maxPriorityFeePerGas))
			.toString();

		return {
			maxFeePerGas: web3.utils.toHex(maxFeePerGas),
			maxPriorityFeePerGas: web3.utils.toHex(maxPriorityFeePerGas)
		};
	} catch (error) {
		console.error('Error getting gas price:', error);
		// Return high default values if we can't get current network values
		return {
			maxFeePerGas: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
			maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('1.5', 'gwei'))
		};
	}
};

export const getTransactionConfig = async (from) => {
	try {
		const gasPrices = await getGasPrice();
		return {
			from,
			gas: web3.utils.toHex('3000000'), // 3M gas limit
			...gasPrices // Spread the maxFeePerGas and maxPriorityFeePerGas
		};
	} catch (error) {
		console.error('Error getting transaction config:', error);
		throw error;
	}
};

export default web3;

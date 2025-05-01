import web3 from './web3';
import ElectionFactory from './Build/ElectionFact.json';

// Create contract instance without default gas options
const instance = new web3.eth.Contract(
    ElectionFactory.abi,
    '0x7891F4412817BA474C88ABA11F3ed8C93C134366' // Contract address
);

export const getContractWithSigner = async () => {
    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
        throw new Error('No MetaMask account available');
    }
    return instance.clone().setProvider(web3.currentProvider);
};

// Export the raw instance for direct method calls
export const rawInstance = instance;

// Add enhanced methods with error handling
const enhancedMethods = {
    createElection: async (email, name, description) => {
        try {
            const accounts = await web3.eth.getAccounts();
            if (!accounts || accounts.length === 0) {
                throw new Error('No MetaMask account available');
            }

            // Calculate start and end times (e.g., start in 1 hour, end in 24 hours)
            const now = Math.floor(Date.now() / 1000); // Current time in seconds
            const startTime = now + 3600; // Start in 1 hour
            const endTime = now + 86400; // End in 24 hours

            // Get current gas price from network
            const gasPrice = await web3.eth.getGasPrice();
            const adjustedGasPrice = Math.floor(Number(gasPrice) * 1.5); // 50% buffer

            // Estimate gas for the transaction
            const gasEstimate = await instance.methods
                .createElection(name, description, startTime, endTime)
                .estimateGas({ from: accounts[0] });

            // Add 20% buffer to gas estimate
            const gasLimit = Math.floor(gasEstimate * 1.2);

            return instance.methods
                .createElection(name, description, startTime, endTime)
                .send({ 
                    from: accounts[0],
                    gas: gasLimit.toString(),
                    gasPrice: adjustedGasPrice.toString()
                });
        } catch (error) {
            console.error('Create election error:', error);
            throw new Error(`Failed to create election: ${error.message}`);
        }
    },
    getDeployedElections: async () => {
        try {
            // No need for account check for read operations
            let elections = [];
            let index = 0;

            while (true) {
                try {
                    const election = await instance.methods.getElectionDetails(index).call();
                    elections.push({
                        index,
                        name: election[0],
                        description: election[1],
                        startTime: election[2],
                        endTime: election[3],
                        isActive: election[4]
                    });
                    index++;
                } catch (error) {
                    // If we get an "Invalid election ID" error, we've reached the end
                    if (error.message.includes("Invalid election ID")) {
                        break;
                    }
                    throw error;
                }
            }
            
            return elections;
        } catch (error) {
            throw new Error(`Failed to get deployed elections: ${error.message}`);
        }
    },
    getElectionCount: async () => {
        try {
            // No need for account check for read operations
            let count = 0;
            while (true) {
                try {
                    await instance.methods.getElectionDetails(count).call();
                    count++;
                } catch (error) {
                    if (error.message.includes("Invalid election ID")) {
                        break;
                    }
                    throw error;
                }
            }
            return count;
        } catch (error) {
            throw new Error(`Failed to get election count: ${error.message}`);
        }
    }
};

export { enhancedMethods };
export default instance;
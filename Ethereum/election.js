import web3 from './web3';
import ElectionFactory from './Build/ElectionFact.json';

// Factory contract address on Sepolia
const FACTORY_ADDRESS = '0x7891F4412817BA474C88ABA11F3ed8C93C134366';

export default electionId => {
    return new web3.eth.Contract(
        ElectionFactory.abi,
        FACTORY_ADDRESS
    );  
};
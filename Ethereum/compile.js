const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const buildPath = path.resolve(__dirname, 'Build');
fs.removeSync(buildPath); //deletes the build folder

const contractPath = path.resolve(__dirname, 'Contracts', 'ElectionFact.sol');
const source = fs.readFileSync(contractPath, 'utf-8');

const input = {
    language: 'Solidity',
    sources: {
        'ElectionFact.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

fs.ensureDirSync(buildPath); //checks if exists; if doesn't, create one

if (output.errors) {
    console.error('Compilation errors:', output.errors);
    process.exit(1);
}

const contract = output.contracts['ElectionFact.sol'].ElectionFact;
fs.outputJsonSync(
    path.resolve(buildPath, 'ElectionFact.json'),
    contract
);

console.log('Contract compiled successfully!');
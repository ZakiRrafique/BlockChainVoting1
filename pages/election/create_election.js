import React, { Component } from 'react';
import { Button, Form, Grid, Header, Segment, Icon, Message } from 'semantic-ui-react';
import web3 from '../../Ethereum/web3';
import Election_Factory from '../../Ethereum/election_factory';
import { Router } from '../../routes';
import Cookies from 'js-cookie';

class LoginForm extends Component {
	state = {
		election_name: '',
		election_description: '',
		loading: false,
		errorMess: '',
		successMess: ''
	};

	async componentDidMount() {
		// Check if user is authenticated
		const companyEmail = Cookies.get('company_email');
		const companyId = Cookies.get('company_id');
		
		if (!companyEmail || !companyId) {
			console.log('No authentication found');
			Router.pushRoute('/company_login');
			return;
		}

		// Request MetaMask connection when component mounts
		if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
			try {
				await window.ethereum.request({ method: 'eth_requestAccounts' });
			} catch (error) {
				console.error('Failed to connect to MetaMask:', error);
			}
		}
	}

	signin = async event => {
		event.preventDefault();
		this.setState({ loading: true, errorMess: '', successMess: '' });
		
		try {
			// Check if MetaMask is installed
			if (!window.ethereum) {
				throw new Error('Please install MetaMask to create an election');
			}

			// Get the current network
			const chainId = await window.ethereum.request({ method: 'eth_chainId' });
			if (chainId !== '0xaa36a7') { // Sepolia chainId
				throw new Error('Please switch to Sepolia network in MetaMask');
			}

			const accounts = await web3.eth.getAccounts();
			if (!accounts || accounts.length === 0) {
				throw new Error('Please unlock your MetaMask wallet');
			}

			// Set up the transaction with start and end times
			const now = Math.floor(Date.now() / 1000); // Current time in seconds
			const startTime = now + 300; // Start in 5 minutes
			const endTime = now + 86400; // End in 24 hours

			// Set up the transaction
			const createElectionTx = Election_Factory.methods.createElection(
				this.state.election_name,
				this.state.election_description,
				startTime.toString(),
				endTime.toString()
			);

			// Estimate gas
			const gasEstimate = await createElectionTx.estimateGas({ from: accounts[0] });
			console.log('Estimated gas:', gasEstimate);

			// Send transaction with estimated gas + buffer
			this.setState({ successMess: 'Please confirm the transaction in MetaMask...' });
			const result = await createElectionTx.send({
				from: accounts[0],
				gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer
				gasPrice: await web3.eth.getGasPrice() // Use current gas price
			});

			console.log('Transaction result:', result);

			// Get the election ID from the transaction events
			const electionId = result.events.ElectionCreated.returnValues.electionId;
			console.log('Created election with ID:', electionId);
			
			this.setState({ 
				loading: false,
				successMess: 'Election created successfully! Redirecting to dashboard...'
			});

			// Store election ID and redirect to dashboard
			Cookies.set('electionId', electionId);
			Cookies.set('address', Election_Factory.options.address); // Store contract address
			Router.pushRoute(`/election/${Election_Factory.options.address}/company_dashboard`);

		} catch (err) {
			console.error('Election creation error:', err);
			this.setState({ 
				errorMess: err.message || 'Failed to create election',
				loading: false 
			});
		}
	};

	LoginForm = () => (
		<div className="login-form">
			<style JSX>{`
				.login-form {
					width:100%;
					height:100%;
					position:absolute;
					background: url('../../static/blockchain.jpg') no-repeat;
				} 
			`}</style>

			<Grid textAlign="center" style={{ height: '100%' }} verticalAlign="middle">
				<Grid.Column style={{ maxWidth: 380 }}>
					<Form size="large">
						<Segment>
							<Header as="h2" color="black" textAlign="center" style={{ marginTop: 10 }}>
								Create an election!
							</Header>
							{this.state.errorMess && (
								<Message negative>
									<Message.Header>Error</Message.Header>
									<p>{this.state.errorMess}</p>
								</Message>
							)}
							{this.state.successMess && (
								<Message positive>
									<Message.Header>Success</Message.Header>
									<p>{this.state.successMess}</p>
								</Message>
							)}
							<Form.Input
								fluid
								iconPosition="left"
								icon="address card outline"
								placeholder="Election Name"
								style={{ padding: 5 }}
								value={this.state.election_name}
								onChange={event => this.setState({ election_name: event.target.value })}
								required={true}
							/>
							<Form.Input
								as="TextArea"
								required={true}
								style={{
									maxHeight: '30px',
									maxWidth: '96%',
									marginBottom: '10px',
								}}
								fluid
								placeholder="Election Description"
								value={this.state.election_description}
								onChange={event => this.setState({ election_description: event.target.value })}
							/>

							<Button
								color="blue"
								fluid
								size="large"
								style={{ marginBottom: 15 }}
								onClick={this.signin}
								loading={this.state.loading}
								disabled={!this.state.election_name || !this.state.election_description || this.state.loading}
							>
								Create Election
							</Button>
							<Message icon info>
								<Icon name="exclamation circle" />
								<Message.Header>Note: </Message.Header>
								<Message.Content>
									1. Make sure you are connected to Sepolia network in MetaMask<br/>
									2. You will need to confirm the transaction in MetaMask<br/>
									3. Election creation will take several minutes
								</Message.Content>
							</Message>
						</Segment>
					</Form>
				</Grid.Column>
			</Grid>
		</div>
	);

	render() {
		return (
			<div>
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
				{this.LoginForm()}
			</div>
		);
	}
}

export default LoginForm;

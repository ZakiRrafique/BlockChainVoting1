import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import factory, { enhancedMethods } from '../../Ethereum/election_factory';
import web3 from '../../Ethereum/web3';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const CompanyDashboard = () => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [elections, setElections] = useState([]);
	const router = useRouter();

	useEffect(() => {
		loadElections();
	}, []);

	const loadElections = async () => {
		try {
			const deployedElections = await enhancedMethods.getDeployedElections();
			setElections(deployedElections);
		} catch (error) {
			console.error('Error loading elections:', error);
			setError('Failed to load elections. Please check your connection and try again.');
		}
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError('');

		try {
			const accounts = await web3.eth.getAccounts();
			if (!accounts || accounts.length === 0) {
				throw new Error('Please connect your MetaMask account');
			}

			await enhancedMethods.createElection(accounts[0], name, description);
			router.push('/');
		} catch (err) {
			console.error('Error creating election:', err);
			setError(err.message || 'Failed to create election. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<style jsx global>{`
				.dashboard-container {
					background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
					min-height: 100vh;
					padding: 2rem 0;
				}
				.create-election-card {
					background: white;
					border-radius: 15px;
					box-shadow: 0 8px 20px rgba(0,0,0,0.1);
					padding: 2rem;
					margin-bottom: 3rem;
				}
				.election-card {
					border: none;
					border-radius: 12px;
					box-shadow: 0 4px 15px rgba(0,0,0,0.05);
					transition: transform 0.2s, box-shadow 0.2s;
					height: 100%;
				}
				.election-card:hover {
					transform: translateY(-5px);
					box-shadow: 0 6px 20px rgba(0,0,0,0.1);
				}
				.btn-primary {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border: none;
					padding: 0.75rem 2rem;
					font-weight: 600;
					border-radius: 8px;
				}
				.btn-primary:hover {
					background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
					transform: translateY(-1px);
				}
				.btn-outline-primary {
					color: #667eea;
					border-color: #667eea;
					border-radius: 8px;
					padding: 0.5rem 1.5rem;
				}
				.btn-outline-primary:hover {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border-color: transparent;
				}
				.form-control {
					border-radius: 8px;
					border: 1px solid #e1e5ea;
					padding: 0.75rem;
					transition: all 0.2s;
				}
				.form-control:focus {
					box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
					border-color: #667eea;
				}
				.section-title {
					color: #2d3748;
					font-weight: 700;
					margin-bottom: 1.5rem;
					position: relative;
					display: inline-block;
				}
				.section-title:after {
					content: '';
					position: absolute;
					bottom: -8px;
					left: 0;
					width: 40px;
					height: 3px;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border-radius: 3px;
				}
			`}</style>
			<div className="dashboard-container">
				<Container>
					<Row className="justify-content-center">
						<Col md={10} lg={8}>
							<div className="create-election-card">
								<h1 className="section-title">Create New Election</h1>
								{error && (
									<Alert variant="danger" className="mb-4">
										{error}
									</Alert>
								)}
								<Form onSubmit={onSubmit}>
									<Form.Group className="mb-4">
										<Form.Label>Election Name</Form.Label>
										<Form.Control
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Enter a descriptive name for your election"
											required
										/>
									</Form.Group>

									<Form.Group className="mb-4">
										<Form.Label>Description</Form.Label>
										<Form.Control
											as="textarea"
											rows={4}
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Provide details about the election, its purpose, and any important information for voters"
											required
										/>
									</Form.Group>

									<Button
										variant="primary"
										type="submit"
										disabled={loading}
										className="w-100"
									>
										{loading ? (
											<>
												<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
												Creating Election...
											</>
										) : (
											'Create Election'
										)}
									</Button>
								</Form>
							</div>

							<h2 className="section-title mt-5">Your Elections</h2>
							<Row>
								{elections.length === 0 ? (
									<Col>
										<Card className="election-card text-center p-5">
											<Card.Body>
												<h5>No Elections Created Yet</h5>
												<p className="text-muted">Create your first election using the form above!</p>
											</Card.Body>
										</Card>
									</Col>
								) : (
									elections.map((election, index) => (
										<Col md={6} lg={4} key={index} className="mb-4">
											<Card className="election-card">
												<Card.Body>
													<Card.Title className="h5 mb-3">{election.name}</Card.Title>
													<Card.Text className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
														{election.description}
													</Card.Text>
													<div className="d-flex justify-content-between align-items-center">
														<span className={`badge ${election.isActive ? 'bg-success' : 'bg-secondary'}`}>
															{election.isActive ? 'Active' : 'Inactive'}
														</span>
														<Button
															variant="outline-primary"
															size="sm"
															onClick={() => router.push(`/election/${index}`)}
														>
															View Details
														</Button>
													</div>
												</Card.Body>
											</Card>
										</Col>
									))
								)}
							</Row>
						</Col>
					</Row>
				</Container>
			</div>
		</Layout>
	);
};

export default CompanyDashboard;

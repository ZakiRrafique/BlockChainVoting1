import React, { Component } from "react";
import {
  Button,
  Divider,
  Transition,
  Form,
  Grid,
  Segment,
  Message
} from "semantic-ui-react";
import {Router} from '../routes'
import web3, { initWeb3 } from "../Ethereum/web3";
import ElectionFactory from "../Ethereum/election_factory";
import Cookies from 'js-cookie';
import {Helmet} from 'react-helmet'

class DividerExampleVerticalForm extends Component {
  state = { 
    visible: true, 
    email: '',
    loading: false,
    errorMessage: '',
    successMessage: ''
  };

  async componentDidMount() {
    // Request MetaMask connection when component mounts
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        // This will trigger MetaMask popup
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
      }
    }
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible });  
  returnBackImage = () => (
    <div className='login-form'>
    <style JSX>{`
        .login-form {
            width:100vw;
            height:100vh;
            position:absolute; 
            background: url('../../static/blockchain.jpg') no-repeat;
            z-index: -1;
        }
      `}</style>
  </div>
  )
  
  signup = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    const email = document.getElementById('signup_email').value;
    const password = document.getElementById('signup_password').value;
    const repeat_password = document.getElementById('signup_repeat_password').value;

    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (password !== repeat_password) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch('/company/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.status === "success") {
        Cookies.set('company_email', encodeURIComponent(email));
        this.setState({ 
          successMessage: 'Registration successful! Please sign in.',
          visible: false 
        });
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      this.setState({ errorMessage: error.message });
      console.error('Signup error:', error);
    } finally {
      this.setState({ loading: false });
    }
  };

  signin = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: '', successMessage: '' });

    try {
      const email = document.getElementById('signin_email').value;
      const password = document.getElementById('signin_password').value;

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // First check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }

      // Request MetaMask account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') { // Sepolia chainId
        throw new Error('Please switch to Sepolia network in MetaMask');
      }

      // Authenticate with backend
      const response = await fetch('/company/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.status === "success") {
        // Set authentication cookies with proper encoding
        Cookies.set('company_id', data.data.id);
        Cookies.set('company_email', email);
        
        // If we get here, everything is good - redirect to create election page
        Router.pushRoute('/election/create_election');
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      this.setState({ 
        errorMessage: error.message || 'An error occurred during sign in',
        loading: false
      });
      console.error('Signin error:', error);
    }
  };

  render() {
    const { visible, loading, errorMessage, successMessage } = this.state;
    return (
      <div>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
        <Helmet>
            <title>Company Login</title>
        </Helmet>
        <div>
          {this.returnBackImage()}

          <Button.Group style={{ marginLeft: "43%" }}>
            <Button
              primary
              content={visible ? "Sign in" : "Sign Up"}
              onClick={this.toggleVisibility}
            />
          </Button.Group>
          <Divider style={{ zIndex: "-10" }} />
          <Grid className="grid1">
            <Grid.Row>
              <Grid.Column
                width={5}
                style={{ marginLeft: "33%", marginTop: "10%" }}
                verticalAlign="middle"
              >
                <Segment placeholder>
                  {errorMessage && (
                    <Message negative>
                      <Message.Header>Error</Message.Header>
                      <p>{errorMessage}</p>
                    </Message>
                  )}
                  {successMessage && (
                    <Message positive>
                      <Message.Header>Success</Message.Header>
                      <p>{successMessage}</p>
                    </Message>
                  )}

                  <Transition
                    visible={!visible}
                    animation="scale"
                    duration={300}
                  >
                    <Form size="large" loading={loading}>
                      <h3 style={{ textAlign: "center" }}>Sign in</h3>
                      <Form.Input
                        fluid
                        id="signin_email"
                        icon="user"
                        iconPosition="left"
                        placeholder="Email"
                        style={{ padding: 5 }}
                      />
                      <Form.Input
                        style={{ padding: 5 }}
                        fluid
                        id="signin_password"
                        icon="lock"
                        iconPosition="left"
                        placeholder="Password"
                        type="password"
                      />

                      <Button
                        onClick={this.signin}
                        color="blue"
                        fluid
                        size="large"
                        style={{ marginBottom: 15 }}
                        loading={loading}
                        disabled={loading}
                      >
                        Sign In
                      </Button>
                    </Form>
                  </Transition>

                  <Transition
                    visible={this.state.visible}
                    animation="scale"
                    duration={300}
                  >
                    <Form size="large" loading={loading}>
                      <h3 style={{ textAlign: "center" }}>Sign up</h3>
                      <Form.Input
                        fluid
                        id="signup_email"
                        icon="user"
                        iconPosition="left"
                        placeholder="Email"
                        style={{ padding: 5 }}
                      />
                      <Form.Input
                        style={{ padding: 5 }}
                        fluid
                        id="signup_password"
                        icon="lock"
                        iconPosition="left"
                        placeholder="Password"
                        type="password"
                      />
                      <Form.Input
                        style={{ padding: 5 }}
                        fluid
                        id="signup_repeat_password"
                        icon="lock"
                        iconPosition="left"
                        placeholder="Repeat Password"
                        type="password"
                      />
                      <Button
                        onClick={this.signup}
                        color="blue"
                        fluid
                        size="large"
                        style={{ marginBottom: 15 }}
                        loading={loading}
                        disabled={loading}
                      >
                        Sign Up
                      </Button>                      
                    </Form>
                  </Transition>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}
export default DividerExampleVerticalForm;

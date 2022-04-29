import React, { useEffect, useState } from "react";
import './app.css';
import twitterLogo from './cosas/twitter-logo.svg';
import { ethers } from "ethers";
import contractAbi from './utils/domains.json';
import polygonLogo from './cosas/polygonlogo.png';
import ethLogo from './cosas/ethlogo.png';
import { networks } from './utils/network';

const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.bolon';
const CONTRACT_ADDRESS = '0x4733bC14872667a384044a33f58C0583B64842b4';

const App = () => {
  //Just a state variable we use to store our user's public wallet. Don't forget to import useState at the top.
  const [currentAccount, setCurrentAccount] = useState('');
  const [domain, setDomain] = useState('');
  const [record, setRecord] = useState('');
  const [network, setNetwork] = useState('');

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }

      // Fancy method to request access to account.
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    
      // Boom! This should print out public address once we authorize Metamask.
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
  
  const checkIfWalletIsConnected = async () => {
   
      const { ethereum } = window;
  
      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });
  
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
      
      // This is the new part, we check the user's network chain ID
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      setNetwork(networks[chainId]);
  
      ethereum.on('chainChanged', handleChainChanged);
      
      // Reload the page when they change networks
      function handleChainChanged(_chainId) {
        window.location.reload();
      }
    };
   

  const mintDomain = async () => {
    // Don't run if the domain is empty
    if (!domain) { return }
    // Alert the user if the domain is too short
    if (domain.length < 3) {
      alert('Domain must be at least 3 characters long');
      return;
    }
    // Calculate price based on length of domain (change this to match your contract)	
    // 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
    const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
    console.log("Minting domain", domain, "with price", price);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
  
        // Check if the transaction was successfully completed
        if (receipt.status === 1) {
          console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
          
          // Set the record for the domain
          tx = await contract.setRecord(domain, record);
          await tx.wait();
  
          console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);
          
          setRecord('');
          setDomain('');
        }
        else {
          alert("Transaction failed! Please try again");
        }
      }
    }
    catch(error){
      console.log(error);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img src="https://media.giphy.com/media/yYrYPXatpCMiA/giphy.gif" alt="Ninja gif" />
      <button  onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    </div>
  );

  const renderInputForm = () => {
		return (
			<div className="form-container">
				<div className="first-row">
					<input
						type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)}
					/>
					<p className='tld'> {tld} </p>
				</div>

				<input
					type="text"
					value={record}
					placeholder='hechale al bolon :)'
					onChange={e => setRecord(e.target.value)}
				/>

				<div className="button-container">
					<button className='cta-button mint-button' onClick={mintDomain}>
						Mint
					</button>  
				
				</div>

			</div>
		);
   }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="body">
      <div className="container">
        <div className="header-container">
          <header>
            <div className="left">
              <p className="title">🐱 Bolon Name Service</p>
              <p className="subtitle">Your API on the blockchain!</p>
            </div>
            <div className="right">
             <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
          { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
             </div>
          </header>
        </div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
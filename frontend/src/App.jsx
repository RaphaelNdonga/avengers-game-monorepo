import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena'
import { CONTRACT_ADDRESS, transformCharacterData } from './constants.jsx';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import LoadingIndicator from './Components/LoadingIndicator';
import avengersIcon from "./favicon.ico";

// Constants
const TWITTER_HANDLE = 'ndonga_raphael';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);

  const [characterNFT, setCharacterNFT] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Ensure you have metamask');
        setIsLoading(false);
        return;
      } else {
        console.log('Metamask present');
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Connected account found! ", account);
          setCurrentAccount(account);
        } else {
          console.log("No account connected");
        }
      }

    } catch (error) {
      console.log("Error while checking wallet connection: ", error);
    }
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/c08954521ac6edf186be9a4e3ed118c1/dc979cf453fc7c40-a5/s400x600/82c0058d1b1ecfe707571e366ca9145c781c7f47.gifv"
            alt="Monty Python Gif"
          />
          <button className="cta-button connect-wallet-button" onClick={connectWalletAction}>Connect Wallet to Get Started</button>
        </div>
      )
    } else if (currentAccount && !characterNFT) {
      return (
        <SelectCharacter setCharacterNFT={setCharacterNFT} />
      )
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      )
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get metamask first");
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected to : ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("Error while connecting wallet: ", error);
    }
  }

  const checkNetworkVersion = async () => {
    try {
      if (window.ethereum.networkVersion !== '4') {
        alert("Please connect to the rinkeby network");
      }
    } catch (error) {
      console.log("Error checking network version: ", error);
    }
  }


  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    checkNetworkVersion();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const myEpicGameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      )
      const txn = await myEpicGameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("This user has NFT: ", txn.name)
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("This user does not have an NFT");
      }
      setIsLoading(false);
    }

    if (currentAccount) {
      fetchNFTMetadata();
    }
  }, [currentAccount])
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <img alt="Avengers Logo" className="twitter-logo" src={avengersIcon} />
          <p className="header gradient-text"> Avengers Endgame </p>
          <p className="sub-text">Team up to protect the Universe from Thanos!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;

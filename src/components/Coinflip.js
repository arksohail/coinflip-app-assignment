import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Coinflip = () => {
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [betAmount, setBetAmount] = useState('');
    const [choice, setChoice] = useState('Heads');
    const [result, setResult] = useState('');
    const [balance, setBalance] = useState('');
    const [isFlipping, setIsFlipping] = useState(false);

    const contractAddress = '0x8AD85C173519734cB33dBE4306274333F569635c';
    const contractABI = [
        "function flip(uint8 userChoice) public payable returns (string memory)",
        "event FlipResult(address player, string result, uint256 amount)",
        "function getBalance() public view returns (uint256)"
    ];


    useEffect(() => {
        // console.log(window.ethereum);
        if (window.ethereum) {
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(newProvider);
        } else {
            alert('Please install MetaMask!');
        }
    }, []);

    const connectWallet = async () => {
        debugger;
        if (provider) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const signer = (await provider.getSigner());
                setWalletAddress(await signer.getAddress());
                setContract(new ethers.Contract(contractAddress, contractABI, signer));
            } catch (error) {
                alert('User rejected the request.');
            }
        }
    };

    const flipCoin = async () => {
        if (contract && betAmount) {
            setIsFlipping(true); 
            const choiceIndex = choice === 'Heads' ? 0 : 1;
            try {
                const tx = await contract.flip(choiceIndex, {
                    value: ethers.parseEther(betAmount)
                });
                const receipt = await tx.wait();
                // Access logs and decode manually
                const iface = new ethers.Interface(contractABI);
                const event = receipt.logs.find(log => {
                    try {
                        iface.parseLog(log);
                        return true;
                    } catch (e) {
                        return false;
                    }
                });
                if (event) {
                    const parsedLog = iface.parseLog(event);
                    const [player, resultMessage, amount] = parsedLog.args;
                    // console.log("Parsed Log Message:", player, resultMessage, amount);
                    setResult(resultMessage); // Update state with the result message
                } else {
                    setResult('No result found in transaction.');
                }
            } catch (error) {
                let err = error.toString();
                // console.log(err)
                // console.log(err.message)
                setResult('Error: ' + error.message);
            } finally {
                setIsFlipping(false);
            }
        } else {
            alert('Please connect wallet and enter bet amount.');
        }
    };

    // const getContractBalance = async () => {
    //     if (contract) {
    //         try {
    //             // Call getBalance method
    //             const balance = await contract.getBalance();
    //             setBalance(ethers.formatEther(balance)); // Convert from Wei to Ether
    //         } catch (error) {
    //             // console.error('Error fetching balance:', error);
    //             setBalance('Error fetching balance');
    //         }
    //     }
    // };

    return (
        <div className="container">
            <div className="glass-card">
                <h1>Coinflip Game</h1>
                <button className="connect-wallet" onClick={connectWallet}>Connect Wallet</button>
                {walletAddress && (
                    <div>
                        <p className="wallet-info">Connected as: {walletAddress}</p>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            placeholder="Enter amount in ETH"
                            step="0.01"
                            className="input-field"
                        />
                        <div className="choice-container">
                            <label>
                                <input
                                    type="radio"
                                    value="Heads"
                                    checked={choice === 'Heads'}
                                    onChange={() => setChoice('Heads')}
                                />
                                Heads
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="Tails"
                                    checked={choice === 'Tails'}
                                    onChange={() => setChoice('Tails')}
                                />
                                Tails
                            </label>
                        </div>
                        <button className="flip-button" onClick={flipCoin} disabled={isFlipping}>
                            {isFlipping ? 'Flipping...' : 'Flip Coin'}
                        </button>
                        <div className={`coin-container ${isFlipping ? 'flipping' : ''}`}>
                            <img src="../images/coin.png" alt="Crypto Coin" className="coin" />
                        </div>
                        <p className="result-message">{result}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Coinflip;
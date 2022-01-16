import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import { useState } from "react";
const ethers = require("ethers");

const { ethereum } = window;

function App() {
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState(null);
    const [contract, setContract] = useState(null);
    const [message, setMessage] = useState("");

    function connectWallet() {
        if (ethereum) {
            ethereum
                .request({
                    method: "eth_requestAccounts",
                })
                .then(() => {
                    const provider = new ethers.providers.Web3Provider(ethereum);
                    setSigner(provider.getSigner());
                    provider
                        .getSigner()
                        .getAddress()
                        .then((address) => {
                            setAddress(address);
                        });
                    console.log(provider);
                })
                .catch(() => {
                    console.log("Failed to connect to MetaMask");
                });
        }
    }
    async function deployContract() {
        try {
            await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x4" }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0x4",
                                chainName: "Rinkeby",
                                rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                            },
                        ],
                    });
                } catch (addError) {
                    // handle "add" error
                }
            }
            // handle other "switch" errors
        }
        const contractJson = require("./contracts/Greeter.json");
        // create contract factory
        const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, signer);
        // create contract
        try {
            factory.deploy("Hello World").then(async (contract) => {
                setMessage("Deploying contract...");
                await contract.deployed();
                setContract(contract);
                setMessage("Contract deployed!");
            });
        } catch (error) {
            console.log(error);
        }
    }

    async function callContract() {
        alert(await contract.greet());
    }

    return (
        <div className="App">
            <div style={{ marginTop: 50 }}>
                {signer ? (
                    <div>
                        <div>{address}</div>
                        {contract ? (
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ marginTop: 50 }}
                                    onClick={callContract}
                                >
                                    Call Contract
                                </button>
                            </div>
                        ) : (
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ marginTop: 50 }}
                                    onClick={deployContract}
                                >
                                    Deploy Contract
                                </button>
                            </div>
                        )}
                        <div>{message}</div>
                    </div>
                ) : (
                    <button type="button" className="btn btn-primary" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;

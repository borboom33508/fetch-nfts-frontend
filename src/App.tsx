import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { useMoralis } from "react-moralis";
import { useMoralisWeb3Api } from "react-moralis";

interface nftProps {
  name: string,
  image: string,
  source: string
}

function App() {
    const [nfts, setNfts] = useState<Array<nftProps>>([]);
    const [currentAddress, setCurrentAddress] = useState("")

    const { authenticate, 
      isAuthenticated,
      isAuthenticating,
      user,
      account,
      logout
    } = useMoralis();
    const Web3Api = useMoralisWeb3Api();

    const login = async () => {
      if (!isAuthenticated) {
        await authenticate({signingMessage: "Log in using Moralis" })
          .then(function (user) {
            console.log("logged in user:", user);
            console.log(user!.get("ethAddress"));
            setCurrentAddress(user?.get("ethAddress"))  // you can change currentAddress to fetch <address> NFTs
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }

    const logOut = async () => {
      await logout();
      console.log("logged out");
      setNfts([])
    }

    useEffect(() => {
      const fetchNFTs = async () => {
        const polygonNFTs = await Web3Api.account.getNFTs({
          chain: "polygon",  // chain 
          address: currentAddress,
        });
        console.log(polygonNFTs);
        if (polygonNFTs?.result) {
          let nfts_array = []
          for (let nft of polygonNFTs?.result) {
            let source = nft.name
            if (nft?.metadata) {
              const metadata = JSON.parse(nft?.metadata)
              // console.log(metadata);
              let image = ''
              if (metadata?.image) image = metadata?.image
              if (metadata?.image_url) image = metadata?.image_url
              if (image.startsWith("ipfs://")) {
                image = image.replace("ipfs://","https://ipfs.io/ipfs/")
              }
              // console.log(image);
              nfts_array.push({
                name: metadata?.name,
                image: image,
                source: source
              })              
            }
          }
        // console.log(nfts_array);
        setNfts(nfts_array)
        }
      }
      if (isAuthenticated){
        fetchNFTs()
      }
    }, [isAuthenticated])

  return (
    <div>
      <h1>Moralis Hello World!</h1>
      <button onClick={login}>Moralis Metamask Login</button>
      <button onClick={logOut} disabled={isAuthenticating}>Logout</button>
      <h2>{user ? user!.get("ethAddress") : "" }</h2>

      {nfts.map((e, index) => (
        <div key={index}>
          <p> {index} // {e.name} // {e.source} </p>
          <img src={e.image} width="200px"/>
        </div>
      ))}
      
    </div>
  );
}

export default App;

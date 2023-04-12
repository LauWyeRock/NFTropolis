To set up -> 
Clone the repo
make .env.local file and put these in (These are from infura) ->
NEXT_PUBLIC_PROJECT_ID=2NBNvnL5enVUKKR0gYCnMyUrGZJ
NEXT_PUBLIC_SECRECT_KEY=0b733edf297425153b6679686531b0b2
NEXT_PUBLIC_SUBDOMAIN=https://is4302.infura-ipfs.io

Then go hardhat.config.js (The info here is from alchemy (private_key is your metamask privatekey))
Go metamask then click the network at the top, click add network, add manually 
Network name : Polygon Mumbai Testnet
RPC URL : https://polygon-mumbai.g.alchemy.com/v2/O3kCCuCNKae145765zyl0DANkC4L8zaF (alchemy)
Chain ID : 80001
Currency : Matic
Block explorer : https://mumbai.polygonscan.com


when u start afresh (always reset ur metamask) -> delete artifacts and cache -> delete the json files in context -> npx hardhat node in one terminal, npx hardhat run scripts/deploy.js —network polygon_mumbai in another terminal (take note of address and change in constants) -> go artifacts/contracts , put json file into context, npm run dev

<div style="background-color: rgb(50, 50, 60);">

``` 
Packages to install 

1.npm install --save-dev hardhat

2.npm install @chainlink/contracts

3.npm install truffle-assertions

4.npm install bignumber.js


```
</div><br/>


<div style="background-color: rgb(50, 50, 60);">

``` 
To run a specific test file:

truffle test test/<fileName>.js

```
</div><br/>

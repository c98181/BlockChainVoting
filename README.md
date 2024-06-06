# BlockChainVoting
2024 Spring NYCU

## Requirements
Install node.js

-download from https://nodejs.org/en

Install ganache

-download from https://archive.trufflesuite.com/ganache/

Install metamask
-download from 



## Usage
First,From the root of this repo,run the following command:

      $cd my-dapp
      $npm install

Then open Ganache and click on "Quickstart",choose one address and copy its private key.

![image](https://github.com/c98181/BlockChainVoting/assets/60998048/5278c4d6-a08d-4438-b9c2-f545977c2b63)

Open metamsk and click "add account"

![image](https://github.com/c98181/BlockChainVoting/assets/60998048/f7469434-e3f2-4150-b0c2-64977c924685)

choose "import account"

![image](https://github.com/c98181/BlockChainVoting/assets/60998048/a032e702-f1ea-42f4-8901-6185bb763e3e)

then enter your private key,Ganache Network is now added to MetaMask.

In my-dapp directory,run:

      $truffle migrate

then:

      $npm start

Then, you should be able to see the URL provided by Ganache. Go to create session.html to create a voting session or vote.html to cast your vote.



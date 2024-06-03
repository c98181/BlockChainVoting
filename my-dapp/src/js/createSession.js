const TruffleContract = require('@truffle/contract');

window.App = {
  start: async function() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.web3Provider = window.ethereum;
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    window.web3 = new Web3(App.web3Provider);

    const response = await fetch('/build/contracts/Voting.json');
    const votingArtifacts = await response.json();
    const VotingContract = TruffleContract(votingArtifacts);
    VotingContract.setProvider(App.web3Provider);

    App.account = (await window.web3.eth.getAccounts())[0];
    document.getElementById("accountAddress").innerText = "Your Address: " + App.account;

    App.contracts = {};
    App.contracts.Voting = VotingContract;
    App.contracts.Voting.defaults({
      from: App.account,
      gas: 6654755
    });

    document.getElementById("createSessionForm").addEventListener("submit", App.createSession);
  },

  createSession: async function(event) {
    event.preventDefault();

    const voteName = document.getElementById("voteName").value;
    const candidateNames = document.getElementById("candidateNames").value.split(",");
    const candidateParties = document.getElementById("candidateParties").value.split(",");
    const voters = document.getElementById("voters").value.split(",");
    const startDate = new Date(document.getElementById("startDate").value).getTime() / 1000;
    const endDate = new Date(document.getElementById("endDate").value).getTime() / 1000;

    const instance = await App.contracts.Voting.deployed();
    try {
      const result = await instance.createSession(voteName, startDate, endDate, candidateNames, candidateParties, voters);
      console.log("Session created:", result);
      alert("Voting session created successfully!");
    } catch (err) {
      console.error("Error creating session:", err);
      alert("Error creating voting session.");
    }
  }
};

window.addEventListener("load", function() {
  window.App.start();
});

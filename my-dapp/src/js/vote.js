const Web3 = require('web3');
const contract = require('@truffle/contract');

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
    const VotingContract = contract(votingArtifacts);
    VotingContract.setProvider(App.web3Provider);

    App.account = (await window.web3.eth.getAccounts())[0];
    document.getElementById("account").innerText = App.account;

    App.contracts = {};
    App.contracts.Voting = VotingContract;
    App.contracts.Voting.defaults({
      from: App.account,
      gas: 6654755
    });

    document.getElementById("loadSessionButton").addEventListener("click", App.loadSession);
    document.getElementById("voteButton").addEventListener("click", App.vote);
  },

  loadSession: async function() {
    const sessionID = document.getElementById("sessionID").value;
    if (!sessionID) {
      alert("Please enter a session ID.");
      return;
    }

    const instance = await App.contracts.Voting.deployed();
    const dates = await instance.getDates(sessionID);
    const countCandidates = await instance.getCountCandidates(sessionID);
    const admin = await instance.getAdmin(sessionID);

    const startDate = new Date(dates[0] * 1000);
    const endDate = new Date(dates[1] * 1000);

    document.getElementById("admin").innerText = admin;
    document.getElementById("startDate").innerText = startDate.toString();
    document.getElementById("endDate").innerText = endDate.toString();

    const candidatesTable = document.getElementById("candidates");
    candidatesTable.innerHTML = ""; // Clear existing candidates

    for (let i = 1; i <= countCandidates; i++) {
      const candidate = await instance.getCandidate(sessionID, i);
      const candidateName = candidate[1].replace(/^\[|]$/g, ''); // Remove surrounding brackets
      const partyName = candidate[2].replace(/^\[|]$/g, ''); // Remove surrounding brackets
      const totalVotes = candidate[3];

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${candidateName}</td>
        <td>${partyName}</td>
        <td>${totalVotes}</td>
        <td><input type="radio" name="candidate" value="${candidate[0]}"></td>
      `;
      candidatesTable.appendChild(row);
    }
  },

  vote: async function() {
    const sessionID = document.getElementById("sessionID").value;
    const candidateID = document.querySelector("input[name='candidate']:checked").value;

    if (!sessionID || !candidateID) {
      alert("Please select a candidate to vote.");
      return;
    }

    const instance = await App.contracts.Voting.deployed();
    try {
      await instance.vote(sessionID, candidateID, { from: App.account });
      alert("Voted successfully!");
    } catch (err) {
      console.error("Error voting:", err);
      alert("Error voting.");
    }
  }
};

window.addEventListener("load", function() {
  App.start();
});

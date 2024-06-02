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
    document.getElementById("accountAddress").innerText = "Your Account: " + App.account;

    App.contracts = {};
    App.contracts.Voting = VotingContract;
    App.contracts.Voting.defaults({
      from: App.account,
      gas: 6654755
    });
  },

  loadSession: async function() {
    const sessionID = document.getElementById("sessionID").value;

    const instance = await App.contracts.Voting.deployed();
    try {
      console.log(`Loading session with ID: ${sessionID}`);
      const dates = await instance.getDates(sessionID);
      console.log(`Session dates: ${dates}`);
      const countCandidates = await instance.getCountCandidates(sessionID);
      console.log(`Count of candidates: ${countCandidates}`);
      const admin = await instance.getAdmin(sessionID);
      console.log(`Admin address: ${admin}`);

      const startDate = new Date(dates[0] * 1000);
      const endDate = new Date(dates[1] * 1000);

      document.getElementById("sessionInfo").innerText = `Admin: ${admin}\nStart Date: ${startDate}\nEnd Date: ${endDate}`;

      let candidatesHtml = '<table>';
      candidatesHtml += '<thead><tr><th>Candidate</th><th>Party</th><th>Votes</th></tr></thead><tbody>';

      for (let i = 1; i <= countCandidates; i++) {
        const candidate = await instance.getCandidate(sessionID, i);
        console.log(`Candidate ${i}: ${candidate}`);
        candidatesHtml += `<tr>
          <td><input type="radio" name="candidate" value="${candidate[0]}">${candidate[1]}</td>
          <td>${candidate[2]}</td>
          <td>${candidate[3]}</td>
        </tr>`;
      }

      candidatesHtml += '</tbody></table>';
      document.getElementById("candidates").innerHTML = candidatesHtml;

      document.getElementById("voteButton").disabled = false;
    } catch (err) {
      console.error("Error loading session:", err);
      alert("Error loading session.");
    }
  },

  vote: async function() {
    const sessionID = document.getElementById("sessionID").value;
    const candidateID = document.querySelector("input[name='candidate']:checked").value;

    if (!candidateID) {
      document.getElementById("msg").innerText = "Please vote for a candidate.";
      return;
    }

    const instance = await App.contracts.Voting.deployed();
    try {
      const result = await instance.vote(sessionID, candidateID);
      document.getElementById("voteButton").disabled = true;
      document.getElementById("msg").innerText = "Voted successfully!";
    } catch (err) {
      console.error("Error voting:", err);
      alert("Error voting.");
    }
  }
};

window.addEventListener("load", function() {
  window.App.start();
});

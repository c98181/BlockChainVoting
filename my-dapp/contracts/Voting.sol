pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    struct VotingSession {
        address admin;
        uint256 votingStart;
        uint256 votingEnd;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) voters;
        mapping(address => bool) registeredVoters;
        uint countCandidates;
    }

    mapping(uint => VotingSession) public votingSessions;
    uint public sessionCount;

    event VoteCast(
        address indexed voter,
        uint indexed sessionID,
        uint indexed candidateID
    );
    event ErrorOccurred(string reason);
    event DatesSet(uint indexed sessionID, uint256 startDate, uint256 endDate);
    event VoterRegistered(uint indexed sessionID, address indexed voter);
    event RegistrationRequested(uint indexed sessionID, address indexed voter);

    function createSession(
        uint256 _startDate,
        uint256 _endDate,
        string[] memory candidateNames,
        string[] memory candidateParties,
        address[] memory voters
    ) public returns (uint) {
        require(
            _endDate > _startDate && _startDate > block.timestamp,
            "Invalid dates"
        );
        require(
            candidateNames.length == candidateParties.length,
            "Candidates and parties must match"
        );

        sessionCount++;
        VotingSession storage session = votingSessions[sessionCount];
        session.admin = msg.sender;
        session.votingStart = _startDate;
        session.votingEnd = _endDate;

        for (uint i = 0; i < candidateNames.length; i++) {
            _addCandidate(sessionCount, candidateNames[i], candidateParties[i]);
        }
        for (uint i = 0; i < voters.length; i++) {
            session.registeredVoters[voters[i]] = true;
        }

        emit DatesSet(sessionCount, _startDate, _endDate);
        return sessionCount;
    }

    function _addCandidate(
        uint sessionID,
        string memory name,
        string memory party
    ) internal {
        VotingSession storage session = votingSessions[sessionID];
        session.countCandidates++;
        session.candidates[session.countCandidates] = Candidate(
            session.countCandidates,
            name,
            party,
            0
        );
    }

    function vote(uint sessionID, uint candidateID) public {
        VotingSession storage session = votingSessions[sessionID];

        require(
            session.votingStart < block.timestamp,
            "Voting has not started yet"
        );
        require(session.votingEnd > block.timestamp, "Voting has ended");
        require(
            session.registeredVoters[msg.sender],
            "You are not registered to vote in this session"
        );
        require(
            candidateID > 0 && candidateID <= session.countCandidates,
            "Invalid candidate ID"
        );
        require(!session.voters[msg.sender], "You have already voted");

        session.voters[msg.sender] = true;
        session.candidates[candidateID].voteCount++;
        emit VoteCast(msg.sender, sessionID, candidateID);
    }

    function checkVote(uint sessionID) public view returns (bool) {
        return votingSessions[sessionID].voters[msg.sender];
    }

    function getCountCandidates(uint sessionID) public view returns (uint) {
        return votingSessions[sessionID].countCandidates;
    }

    function getCandidate(
        uint sessionID,
        uint candidateID
    ) public view returns (uint, string memory, string memory, uint) {
        Candidate storage candidate = votingSessions[sessionID].candidates[
            candidateID
        ];
        return (
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.voteCount
        );
    }

    function getDates(uint sessionID) public view returns (uint256, uint256) {
        VotingSession storage session = votingSessions[sessionID];
        return (session.votingStart, session.votingEnd);
    }

    function getCondition(uint sessionID) public view returns (string memory) {
        VotingSession storage session = votingSessions[sessionID];
        if (block.timestamp < session.votingStart) {
            return "Hasn't started";
        } else if (block.timestamp > session.votingEnd) {
            return "Has ended";
        } else {
            return "In process";
        }
    }

    function getAdmin(uint sessionID) public view returns (address) {
        return votingSessions[sessionID].admin;
    }
}

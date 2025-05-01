// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ElectionFact {
    struct Election {
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) voteCount;
    }

    Election[] public elections;
    address public owner;

    event ElectionCreated(uint256 electionId, string name, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 electionId, address voter, uint256 candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyOwner returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        uint256 electionId = elections.length;
        elections.push();
        Election storage newElection = elections[electionId];
        
        newElection.name = _name;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.isActive = true;

        emit ElectionCreated(electionId, _name, _startTime, _endTime);
        return electionId;
    }

    function castVote(uint256 _electionId, uint256 _candidateId) public {
        require(_electionId < elections.length, "Invalid election ID");
        Election storage election = elections[_electionId];
        
        require(election.isActive, "Election is not active");
        require(block.timestamp >= election.startTime, "Election has not started");
        require(block.timestamp <= election.endTime, "Election has ended");
        require(!election.hasVoted[msg.sender], "You have already voted");

        election.hasVoted[msg.sender] = true;
        election.voteCount[_candidateId]++;

        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    function getElectionDetails(uint256 _electionId) public view returns (
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        require(_electionId < elections.length, "Invalid election ID");
        Election storage election = elections[_electionId];
        
        return (
            election.name,
            election.description,
            election.startTime,
            election.endTime,
            election.isActive
        );
    }

    function getVoteCount(uint256 _electionId, uint256 _candidateId) public view returns (uint256) {
        require(_electionId < elections.length, "Invalid election ID");
        return elections[_electionId].voteCount[_candidateId];
    }

    function hasVoted(uint256 _electionId, address _voter) public view returns (bool) {
        require(_electionId < elections.length, "Invalid election ID");
        return elections[_electionId].hasVoted[_voter];
    }

    function endElection(uint256 _electionId) public onlyOwner {
        require(_electionId < elections.length, "Invalid election ID");
        require(elections[_electionId].isActive, "Election is already ended");
        
        elections[_electionId].isActive = false;
    }
} 
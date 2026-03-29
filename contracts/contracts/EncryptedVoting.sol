// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, euint8, InEuint8} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract EncryptedVoting {
    struct Proposal {
        string title;
        uint256 deadline;
        bool exists;
        bool finalized;
        uint8 optionsCount;
        euint64[] tallies;
    }

    uint256 public proposalCount;
    address public owner;

    mapping(uint256 proposalId => Proposal) private proposals;
    mapping(uint256 proposalId => mapping(address voter => bool)) public hasVoted;

    euint64 private immutable EUINT64_ZERO;
    euint64 private immutable EUINT64_ONE;
    euint64 private immutable EUINT64_EIGHT;

    event ProposalCreated(uint256 indexed proposalId, string title, uint8 optionsCount, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event VoteFinalizationRequested(uint256 indexed proposalId);

    error NotOwner();
    error InvalidProposal();
    error InvalidOptionsCount();
    error DeadlineInPast();
    error VotingClosed();
    error VotingStillOpen();
    error AlreadyVoted();
    error ProposalFinalized();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        EUINT64_ZERO = FHE.asEuint64(0);
        EUINT64_ONE = FHE.asEuint64(1);
        EUINT64_EIGHT = FHE.asEuint64(8);
        FHE.allowThis(EUINT64_ZERO);
        FHE.allowThis(EUINT64_ONE);
        FHE.allowThis(EUINT64_EIGHT);
    }

    function createProposal(
        string calldata title,
        uint8 optionsCount,
        uint256 deadline
    ) external onlyOwner returns (uint256 proposalId) {
        if (optionsCount < 2 || optionsCount > 8) revert InvalidOptionsCount();
        if (deadline <= block.timestamp) revert DeadlineInPast();

        proposalId = proposalCount;
        Proposal storage proposal = proposals[proposalId];

        proposal.title = title;
        proposal.deadline = deadline;
        proposal.exists = true;
        proposal.optionsCount = optionsCount;

        for (uint8 i = 0; i < optionsCount; i++) {
            proposal.tallies.push(FHE.asEuint64(0));
            FHE.allowThis(proposal.tallies[i]);
        }

        proposalCount = proposalId + 1;

        emit ProposalCreated(proposalId, title, optionsCount, deadline);
    }

    function vote(uint256 proposalId, InEuint8 calldata encryptedOption) external {
        Proposal storage proposal = proposals[proposalId];

        if (!proposal.exists) revert InvalidProposal();
        if (proposal.finalized) revert ProposalFinalized();
        if (block.timestamp >= proposal.deadline) revert VotingClosed();
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted();

        euint8 option = FHE.asEuint8(encryptedOption);
        euint64 option64 = FHE.asEuint64(option);
        FHE.allowThis(option);
        FHE.allowThis(option64);

        for (uint8 i = 0; i < proposal.optionsCount; i++) {
            euint64 key64 = FHE.sub(EUINT64_EIGHT, FHE.asEuint64(8 - i));
            FHE.allowThis(key64);
            euint64 delta = FHE.select(option64.eq(key64), EUINT64_ONE, EUINT64_ZERO);
            FHE.allowThis(delta);
            proposal.tallies[i] = FHE.add(proposal.tallies[i], delta);
            FHE.allowThis(proposal.tallies[i]);
        }

        hasVoted[proposalId][msg.sender] = true;

        FHE.allowSender(option);

        emit VoteCast(proposalId, msg.sender);
    }

    function finalizeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];

        if (!proposal.exists) revert InvalidProposal();
        if (proposal.finalized) revert ProposalFinalized();
        if (block.timestamp < proposal.deadline) revert VotingStillOpen();

        for (uint8 i = 0; i < proposal.optionsCount; i++) {
            FHE.decrypt(proposal.tallies[i]);
        }

        proposal.finalized = true;

        emit VoteFinalizationRequested(proposalId);
    }

    function decryptResultForOption(uint256 proposalId, uint8 optionIndex) external view returns (uint256 value, bool ready) {
        Proposal storage proposal = proposals[proposalId];

        if (!proposal.exists) revert InvalidProposal();
        if (optionIndex >= proposal.optionsCount) revert InvalidProposal();

        return FHE.getDecryptResultSafe(proposal.tallies[optionIndex]);
    }

    function getProposalSummary(
        uint256 proposalId
    )
        external
        view
        returns (
            string memory title,
            uint256 deadline,
            bool exists,
            bool finalized,
            uint8 optionsCount
        )
    {
        Proposal storage proposal = proposals[proposalId];

        title = proposal.title;
        deadline = proposal.deadline;
        exists = proposal.exists;
        finalized = proposal.finalized;
        optionsCount = proposal.optionsCount;
    }

    function getEncryptedTallies(uint256 proposalId) external view returns (euint64[] memory) {
        Proposal storage proposal = proposals[proposalId];
        if (!proposal.exists) revert InvalidProposal();
        return proposal.tallies;
    }
}

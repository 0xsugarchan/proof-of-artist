// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal Sepolia demo registry (not full ERC-8004). Matches `demoRegistryAbi` in the app.
contract DemoAgentRegistry {
    struct Agent {
        address owner;
        string claimedEnsName;
        string agentName;
        string agentRole;
        string metadataURI;
    }

    mapping(uint256 => Agent) public agents;

    function setAgent(
        uint256 agentId,
        address owner_,
        string calldata claimedEnsName,
        string calldata agentName,
        string calldata agentRole,
        string calldata metadataURI
    ) external {
        agents[agentId] = Agent(owner_, claimedEnsName, agentName, agentRole, metadataURI);
    }
}

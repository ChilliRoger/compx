// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimilarityChecker
 * @notice Smart contract for on-chain code similarity analysis
 * @dev This contract allows users to compare smart contract bytecode and store results on-chain
 */
contract SimilarityChecker {
    struct ComparisonResult {
        address contract1;
        address contract2;
        uint256 similarityScore; // Score out of 10000 (100.00%)
        uint256 timestamp;
        address requester;
    }

    // Mapping from comparison ID to results
    mapping(bytes32 => ComparisonResult) public comparisons;
    
    // Fee for comparison in wei
    uint256 public comparisonFee;
    
    // Owner of the contract
    address public owner;
    
    // Events
    event ComparisonRequested(
        bytes32 indexed comparisonId,
        address indexed contract1,
        address indexed contract2,
        address requester
    );
    
    event ComparisonCompleted(
        bytes32 indexed comparisonId,
        uint256 similarityScore
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor(uint256 _comparisonFee) {
        owner = msg.sender;
        comparisonFee = _comparisonFee;
    }
    
    /**
     * @notice Request a comparison between two contracts
     * @param _contract1 Address of the first contract
     * @param _contract2 Address of the second contract
     * @return comparisonId Unique ID for this comparison
     */
    function requestComparison(
        address _contract1,
        address _contract2
    ) external payable returns (bytes32) {
        require(msg.value >= comparisonFee, "Insufficient fee");
        require(_contract1 != address(0) && _contract2 != address(0), "Invalid addresses");
        require(_isContract(_contract1) && _isContract(_contract2), "Addresses must be contracts");
        
        bytes32 comparisonId = keccak256(
            abi.encodePacked(_contract1, _contract2, block.timestamp, msg.sender)
        );
        
        comparisons[comparisonId] = ComparisonResult({
            contract1: _contract1,
            contract2: _contract2,
            similarityScore: 0, // Will be updated by oracle/backend
            timestamp: block.timestamp,
            requester: msg.sender
        });
        
        emit ComparisonRequested(comparisonId, _contract1, _contract2, msg.sender);
        
        return comparisonId;
    }
    
    /**
     * @notice Get bytecode of a contract (helper for off-chain)
     * @param _contract Address of the contract
     * @return Bytecode of the contract
     */
    function getContractCode(address _contract) external view returns (bytes memory) {
        return _contract.code;
    }
    
    /**
     * @notice Basic on-chain similarity check using code size and hash
     * @param _contract1 Address of the first contract
     * @param _contract2 Address of the second contract
     * @return similarityScore Basic similarity score (0-10000)
     */
    function quickSimilarityCheck(
        address _contract1,
        address _contract2
    ) external view returns (uint256) {
        bytes memory code1 = _contract1.code;
        bytes memory code2 = _contract2.code;
        
        // If identical, return perfect score
        if (keccak256(code1) == keccak256(code2)) {
            return 10000;
        }
        
        // Simple size-based similarity
        uint256 size1 = code1.length;
        uint256 size2 = code2.length;
        
        if (size1 == 0 || size2 == 0) {
            return 0;
        }
        
        uint256 sizeDiff = size1 > size2 ? size1 - size2 : size2 - size1;
        uint256 maxSize = size1 > size2 ? size1 : size2;
        
        // Calculate similarity based on size difference
        uint256 similarity = ((maxSize - sizeDiff) * 10000) / maxSize;
        
        return similarity;
    }
    
    /**
     * @notice Update comparison result (called by oracle or owner)
     * @param _comparisonId ID of the comparison
     * @param _similarityScore Computed similarity score
     */
    function updateComparisonResult(
        bytes32 _comparisonId,
        uint256 _similarityScore
    ) external onlyOwner {
        require(comparisons[_comparisonId].timestamp > 0, "Comparison not found");
        require(_similarityScore <= 10000, "Invalid score");
        
        comparisons[_comparisonId].similarityScore = _similarityScore;
        
        emit ComparisonCompleted(_comparisonId, _similarityScore);
    }
    
    /**
     * @notice Get comparison result
     * @param _comparisonId ID of the comparison
     * @return ComparisonResult struct
     */
    function getComparison(bytes32 _comparisonId) external view returns (ComparisonResult memory) {
        return comparisons[_comparisonId];
    }
    
    /**
     * @notice Update comparison fee
     * @param _newFee New fee in wei
     */
    function updateFee(uint256 _newFee) external onlyOwner {
        uint256 oldFee = comparisonFee;
        comparisonFee = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @notice Withdraw collected fees
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner).transfer(balance);
    }
    
    /**
     * @notice Check if an address is a contract
     * @param _addr Address to check
     * @return True if address is a contract
     */
    function _isContract(address _addr) private view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(_addr)
        }
        return size > 0;
    }
}

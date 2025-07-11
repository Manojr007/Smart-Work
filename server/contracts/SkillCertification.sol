// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SkillCertification
 * @dev Smart contract for storing skill certificate hashes on Polygon network
 */
contract SkillCertification is Ownable, Pausable {
    
    struct Certification {
        string certificateHash;
        uint256 timestamp;
        bool isValid;
        string skillName;
    }
    
    // Mapping: user address => skill name => certification
    mapping(address => mapping(string => Certification)) public certifications;
    
    // Mapping: certificate hash => user address (for reverse lookup)
    mapping(string => address) public hashToUser;
    
    // Events
    event SkillCertified(address indexed user, string skillName, string certificateHash, uint256 timestamp);
    event CertificationRevoked(address indexed user, string skillName, uint256 timestamp);
    event CertificationUpdated(address indexed user, string skillName, string newHash, uint256 timestamp);
    
    // Modifiers
    modifier onlyValidSkill(string memory skillName) {
        require(bytes(skillName).length > 0, "Skill name cannot be empty");
        _;
    }
    
    modifier onlyValidHash(string memory certificateHash) {
        require(bytes(certificateHash).length > 0, "Certificate hash cannot be empty");
        require(hashToUser[certificateHash] == address(0), "Certificate hash already exists");
        _;
    }
    
    /**
     * @dev Certify a skill for a user
     * @param skillName Name of the skill
     * @param certificateHash SHA-256 hash of the certificate
     * @param userAddress Address of the user being certified
     */
    function certifySkill(
        string memory skillName,
        string memory certificateHash,
        address userAddress
    ) external onlyOwner onlyValidSkill(skillName) onlyValidHash(certificateHash) whenNotPaused {
        require(userAddress != address(0), "Invalid user address");
        
        // Create certification
        certifications[userAddress][skillName] = Certification({
            certificateHash: certificateHash,
            timestamp: block.timestamp,
            isValid: true,
            skillName: skillName
        });
        
        // Map hash to user for reverse lookup
        hashToUser[certificateHash] = userAddress;
        
        emit SkillCertified(userAddress, skillName, certificateHash, block.timestamp);
    }
    
    /**
     * @dev Get certification details for a user and skill
     * @param userAddress Address of the user
     * @param skillName Name of the skill
     * @return certificateHash Hash of the certificate
     * @return timestamp When the certification was issued
     * @return isValid Whether the certification is still valid
     */
    function getCertification(
        address userAddress,
        string memory skillName
    ) external view returns (string memory certificateHash, uint256 timestamp, bool isValid) {
        Certification memory cert = certifications[userAddress][skillName];
        return (cert.certificateHash, cert.timestamp, cert.isValid);
    }
    
    /**
     * @dev Check if a user is certified for a specific skill
     * @param userAddress Address of the user
     * @param skillName Name of the skill
     * @return True if certified and valid
     */
    function isCertified(address userAddress, string memory skillName) external view returns (bool) {
        return certifications[userAddress][skillName].isValid;
    }
    
    /**
     * @dev Verify a certificate hash exists and is valid
     * @param certificateHash Hash to verify
     * @return userAddress Address of the certified user
     * @return skillName Name of the skill
     * @return isValid Whether the certification is valid
     */
    function verifyCertificate(string memory certificateHash) external view returns (
        address userAddress,
        string memory skillName,
        bool isValid
    ) {
        userAddress = hashToUser[certificateHash];
        if (userAddress != address(0)) {
            Certification memory cert = certifications[userAddress][skillName];
            skillName = cert.skillName;
            isValid = cert.isValid;
        }
    }
    
    /**
     * @dev Revoke a certification (only owner)
     * @param userAddress Address of the user
     * @param skillName Name of the skill
     */
    function revokeCertification(
        address userAddress,
        string memory skillName
    ) external onlyOwner onlyValidSkill(skillName) {
        require(certifications[userAddress][skillName].isValid, "Certification not found or already revoked");
        
        certifications[userAddress][skillName].isValid = false;
        
        emit CertificationRevoked(userAddress, skillName, block.timestamp);
    }
    
    /**
     * @dev Update a certification with a new hash (only owner)
     * @param userAddress Address of the user
     * @param skillName Name of the skill
     * @param newCertificateHash New certificate hash
     */
    function updateCertification(
        address userAddress,
        string memory skillName,
        string memory newCertificateHash
    ) external onlyOwner onlyValidSkill(skillName) onlyValidHash(newCertificateHash) {
        require(certifications[userAddress][skillName].isValid, "Certification not found or invalid");
        
        // Remove old hash mapping
        string memory oldHash = certifications[userAddress][skillName].certificateHash;
        delete hashToUser[oldHash];
        
        // Update certification
        certifications[userAddress][skillName].certificateHash = newCertificateHash;
        certifications[userAddress][skillName].timestamp = block.timestamp;
        
        // Add new hash mapping
        hashToUser[newCertificateHash] = userAddress;
        
        emit CertificationUpdated(userAddress, skillName, newCertificateHash, block.timestamp);
    }
    
    /**
     * @dev Batch certify multiple skills for a user
     * @param userAddress Address of the user
     * @param skillNames Array of skill names
     * @param certificateHashes Array of certificate hashes
     */
    function batchCertify(
        address userAddress,
        string[] memory skillNames,
        string[] memory certificateHashes
    ) external onlyOwner whenNotPaused {
        require(userAddress != address(0), "Invalid user address");
        require(skillNames.length == certificateHashes.length, "Arrays length mismatch");
        require(skillNames.length > 0, "Empty arrays");
        
        for (uint i = 0; i < skillNames.length; i++) {
            require(bytes(skillNames[i]).length > 0, "Skill name cannot be empty");
            require(bytes(certificateHashes[i]).length > 0, "Certificate hash cannot be empty");
            require(hashToUser[certificateHashes[i]] == address(0), "Certificate hash already exists");
            
            certifications[userAddress][skillNames[i]] = Certification({
                certificateHash: certificateHashes[i],
                timestamp: block.timestamp,
                isValid: true,
                skillName: skillNames[i]
            });
            
            hashToUser[certificateHashes[i]] = userAddress;
            
            emit SkillCertified(userAddress, skillNames[i], certificateHashes[i], block.timestamp);
        }
    }
    
    /**
     * @dev Get all certifications for a user
     * @param userAddress Address of the user
     * @return skillNames Array of skill names
     * @return certificateHashes Array of certificate hashes
     * @return timestamps Array of timestamps
     * @return validStatus Array of validity status
     */
    function getUserCertifications(address userAddress) external view returns (
        string[] memory skillNames,
        string[] memory certificateHashes,
        uint256[] memory timestamps,
        bool[] memory validStatus
    ) {
        // Note: This is a simplified version. In a real implementation,
        // you might want to store an array of user skills for easier iteration
        
        // For now, return empty arrays as this would require additional storage
        skillNames = new string[](0);
        certificateHashes = new string[](0);
        timestamps = new uint256[](0);
        validStatus = new bool[](0);
    }
    
    /**
     * @dev Pause the contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract information
     * @return contractName Name of the contract
     * @return version Version of the contract
     */
    function getContractInfo() external pure returns (string memory contractName, string memory version) {
        return ("SkillCertification", "1.0.0");
    }
} 
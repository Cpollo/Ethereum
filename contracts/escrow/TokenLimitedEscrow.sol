pragma solidity ^0.4.24;

import "../math/SafeMath.sol";
import "../ownership/Secondary.sol";
import "../access/EscrowManagerRole.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/rbac/Roles.sol";
/**
 * @title TokenEscrow
 * @dev Base escrow contract, holds token funds destinated to a role until they
 * withdraw them. The contract that uses the escrow as its payment method
 * should be its primary, and provide public methods redirecting to the escrow's
 * deposit and withdraw.
 */
contract TokenLimitedEscrow is TokenEscrow {
    using SafeMath for uint256;

    // Total Tokens Payed
    uint256 _tokensPayed;
    // Total Tokens Payement limit
    uint256 _tokensPayedLimit;
    // Timestamp interval where tokens payed back to zero
    uint256 _timestampInterval;
    // The last time where funds where resetted
    uint256 _timestampNow;

    event LimitChanged(address indexed account, uint256 indexed newLimit);
    event TimestampIntervalChanged(address indexed account, uint256 indexed newTimestampInvterval);

    mapping(address => uint256) private _transfers;

      /**
   * @dev 
   * @param tokensLimit Max token value we can spend at each timestampInterval
   * @param timestampInterval Timestamp interval to reset token limit
   */
    constructor(uint256 tokensLimit, uint256 timestampInterval) public { 
        require(tokensLimit >0);
        require(timestampInterval > 0 );
        _tokensPayedLimit = tokensLimit;
        _timestampInterval = timestampInterval;
        _timestampNow = block.timestamp;
    }

   /**
   * @dev Can be overridden to add pre transfer logic. The overriding function
   * should call super._preTransfer(payed, amount) to ensure the chain of transfer is
   * executed entirely.
   */
    function _preTransfer(address payee, uint256 amount) internal {
        super._preTransfer(paye, amount);
        require(_tokensPayed.add(amount) < _tokensPayedLimit, "Limit tokens passed");
        _tokensPayed = _tokensPayed.add(amount);
        
    }
     /**
   * @dev Call to reset tokens payed, and then Escrow can do more Payments
   */
    function resetTokenTotalPayments(address payee, uint256 amount) public {      
        require(_timestampNow.add(_timestampInterval) < block.timestamp, "Not enough time passed");
        _timestampNow = block.timestamp;
        _tokensPayed = 0;
    }
    
    /**
    * @dev Change the token limit
    */
    function changeTokenLimit(uint256 newLimit) public onlyEscrowManager  {      
        _tokensPayedLimit = newLimit;
        emit LimitChanged(msg.send, newLimit);
    }
      /**
    * @dev Change the token interval timestamp limit
    */
    function changeTimestampInterval(uint256 newTimestampInvterval) public onlyEscrowManager  {      
        _tokensPayedLimit = newLimit;
        emit TimestampIntervalChanged(msg.send, newTimestampInvterval);
    }


}
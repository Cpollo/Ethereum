pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../validation/TokenTimedCrowdsale.sol";

/**
 * @title TokenFinalizableCrowdsale
 * @dev Extension of Crowdsale with a one-off finalization action, where one
 * can do extra work after finishing.
 */
contract TokenFinalizableCrowdsale is TokenTimedCrowdsale {
    using SafeMath for uint256;

    bool private _finalized;

    event CrowdsaleFinalized();

    constructor() public {
        _finalized = false;
    }

    /**
    * @return true if the crowdsale is finalized, false otherwise.
    */
    function finalized() public view returns (bool) {
        return _finalized;
    }

    /**
    * @dev Must be called after crowdsale ends, to do some extra finalization
    * work. Calls the contract's finalization function.
    */
    function finalize() public {
        require(!_finalized);
        require(hasClosed());

        _finalization();
        emit CrowdsaleFinalized();

        _finalized = true;
    }

    /**
    * @dev Can be overridden to add finalization logic. The overriding function
    * should call super._finalization() to ensure the chain of finalization is
    * executed entirely.
    */
    function _finalization() internal {
    }

}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

contract PutOptionHandler is AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    struct Opt {
        uint256 strike;
        uint256 premium;
		uint256 amount;
        uint256 expiry;
        address seller;
        address buyer;
		address asset;
        bool    assetSent;
        bool    fundSent;
    }

	uint256 public optCount;
    mapping(uint256 => Opt) public opts;
    
    address public usdc;
    address private constant ETH = address(0);

	event OptCreated(
        uint256 optId,
        address indexed seller,
        uint256 strike,
        uint256 premium,
		address asset,
		uint256 amount,
        uint256 expiry
    );

    event OptBought(uint256 optId, address indexed buyer);
    event OptExercised(uint256 optId, address indexed buyer);
    event OptDeleted(uint256 optId);
    event AssetSent(uint256 optId, address indexed buyer);
    event AssetReclaimed(uint256 optId, address indexed buyer);


    constructor(address _usdc) {
        require(_usdc != address(0), "USDC address cannot be zero");
        usdc = _usdc;
    }


    function checkUpkeep(bytes calldata) external override returns (bool upkeepNeeded, bytes memory performData) {
        uint256 count = 0;
        uint256[] memory exercisedOpts = new uint256[](optCount);

        for (uint256 i = 0; i < optCount; i++) {
            if (block.timestamp >= opts[i].expiry) {
                Opt storage opt = opts[i];
                if (opt.assetSent) {
                    count++;
                    exercisedOpts[count] = i;
                }
                else {
                    // Give back the money to the seller if put option buyer has not transfered the asset at expiry
                    IERC20(usdc).safeTransfer(opt.seller, opt.strike);
                    delete opts[i];
                    emit OptDeleted(i);
                }
            }
        }

        if (count > 0) {
            upkeepNeeded = true;
            performData = abi.encode(exercisedOpts, count);
        } else {
            upkeepNeeded = false;
            performData = "";
        }
    }

    function performUpkeep(bytes calldata performData) external {
        (uint256[] memory exercisedOpts, uint256 count) = abi.decode(performData, (uint256[], uint256));
        for (uint256 i = 0; i < count; i++) {
            _settleExpiredOpt(exercisedOpts[i]);
        }
    }


    function _settleExpiredOpt(uint256 optId) internal {
        Opt storage opt = opts[optId];
        require(block.timestamp >= opt.expiry, "Option has not expired yet");
        if (opt.asset == ETH) {
            (bool success, ) = payable(opt.seller).call{value: opt.amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(opt.asset).safeTransfer(opt.seller, opt.amount);
        }
        IERC20(usdc).safeTransfer(opt.buyer, opt.strike);
        emit OptDeleted(optId);
        delete opts[optId];
    }

    function createPutOpt(
        uint256 strike,
        uint256 premium,
        uint256 expiry,
        address asset,
        uint256 amount
    ) external {
        require(expiry > block.timestamp, "Expiry must be in the future");

        uint256 allowance = IERC20(usdc).allowance(msg.sender, address(this));
        require(allowance >= strike, "Insufficient allowance for seller (PUT)");
        uint256 balance = IERC20(usdc).balanceOf(msg.sender);
        require(balance >= strike, "Insufficient balance for seller (PUT)");

        IERC20(usdc).safeTransferFrom(msg.sender, address(this), strike);
        opts[optCount] = Opt({
            seller: msg.sender,
            buyer: address(0),
            strike: strike,
            premium: premium,
            expiry: expiry,
            asset: asset,
            amount: amount,
            assetSent: false,
            fundSent: true
        });

        emit OptCreated(optCount, msg.sender, strike, premium, asset, amount, expiry);
        optCount++;
    }

    function deletePutOpt(uint256 optId) external {
        Opt storage opt = opts[optId];
        require(msg.sender == opt.seller, "Only the seller can call this function");
        require(opt.buyer == address(0), "Option already bought");
        require(opt.expiry > block.timestamp, "Option has expired");

        uint256 strike = opt.strike;
        address seller = opt.seller;
        emit OptDeleted(optId);
        delete opts[optId];

        IERC20(usdc).safeTransfer(seller, strike);
    }

    function buyOpt(uint256 optId) external payable {
        Opt storage opt = opts[optId];

        require(opt.buyer == address(0), "Option already bought");
        require(opt.expiry > block.timestamp, "Option has expired");

        uint256 allowance = IERC20(usdc).allowance(msg.sender, address(this));
        require(allowance >= opt.premium, "Insufficient allowance for buyer (PUT)");
        uint256 balance = IERC20(usdc).balanceOf(msg.sender);
        require(balance >= opt.premium, "Insufficient balance for buyer (PUT)");

        IERC20(usdc).safeTransferFrom(msg.sender, opt.seller, opt.premium);
        opt.buyer = msg.sender;
        emit OptBought(optId, msg.sender);
    }

    function sendAsset(uint256 optId) external payable {
        Opt storage opt = opts[optId];

        require(msg.sender == opt.buyer, "Only the buyer can call this function");
        require(!opt.assetSent, "Asset already sent");
        require(opt.expiry > block.timestamp, "Option has expired");

        if (opt.asset == ETH) {
            require(msg.value == opt.amount, "Incorrect ETH amount sent");
        } else {
            uint256 allowance = IERC20(opt.asset).allowance(msg.sender, address(this));
            require(allowance >= opt.amount, "Insufficient asset allowance for buyer (PUT)");
            IERC20(opt.asset).safeTransferFrom(msg.sender, address(this), opt.amount);
        }
        opt.assetSent = true;
        emit AssetSent(optId, msg.sender);
    }

    function reclaimAsset(
        uint256 optId
    ) external {
        Opt storage opt = opts[optId];
        require(msg.sender == opt.buyer, "Only the buyer can call this function");
        require(opt.assetSent, "No asset to reclaim");
        require(opt.expiry > block.timestamp, "Option has expired");

        if (opt.asset == ETH) {
            (bool success, ) = payable(msg.sender).call{value: opt.amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(opt.asset).safeTransfer(msg.sender, opt.amount);
        }

        opt.assetSent = false;
        emit AssetReclaimed(optId, msg.sender);
    }

    fallback() external payable {
        revert("Unknown function call");
    }

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}

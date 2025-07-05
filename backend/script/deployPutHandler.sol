// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {PutOptionHandler} from "../src/PutOptionHandler.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {ERC20Mock} from "../src/mocks/ERC20mock.sol";

contract DeployPutOptionHandler is Script {

	function run() external {
		deployPutOptionHandler();
	}

	function deployPutOptionHandler() public returns (PutOptionHandler, HelperConfig, address) {
		HelperConfig helperConfig = new HelperConfig();
		HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
		console.log("Working on Network: ", networkConfig.network);
		address usdcAddress = networkConfig.usdc_address;
		address owner = networkConfig.account;

		vm.startBroadcast(owner);
		PutOptionHandler putOptionHandler = new PutOptionHandler(usdcAddress);
		vm.stopBroadcast();
		
		return (putOptionHandler, helperConfig, usdcAddress);
	}
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {

	error HelperConfig_invalidChainID();

	NetworkConfig private activeNetworkconfig;

	struct NetworkConfig {
		string network;
		address usdc_address;
		address account;
		address optionManagerContractAddress;
	}

	constructor () {
		if (block.chainid == 747) {
			activeNetworkconfig = getFlowEVMConfig();
		}
		else {
			revert HelperConfig_invalidChainID();
		}
	}


	function getFlowEVMConfig() public pure returns(NetworkConfig memory) {
		NetworkConfig memory flowEVMConfig = NetworkConfig({
			network: "Flow EVM",
			usdc_address:  0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED,
			account: 0x315f84F1c14676b240b13Fa675DB2dEc4bA7bDb9,
			optionManagerContractAddress: address(0)
		});
		return flowEVMConfig;
	}
	
	function getActiveNetworkConfig() public view returns(NetworkConfig memory) {
		return activeNetworkconfig;
	}
}	
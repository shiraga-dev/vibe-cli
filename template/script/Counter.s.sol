// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "vibe-core/Script.sol";
import "../src/Counter.sol";

contract Increment is Script {
  function run() external broadcast {
    address addr = vm.envAddress("Counter");
    Counter(addr).increment();
  }
}

contract Decrement is Script {
  function run() external broadcast {
    address addr = vm.envAddress("Counter");
    Counter(addr).decrement();
  }
}

contract Add is Script {
  function args(uint value) public {}
  function run() external broadcast {
    address addr = vm.envAddress("Counter");
    uint value = vm.envUint("ARG0");
    Counter(addr).add(value);
  }
}

contract Subtract is Script {
  function args(uint value) public {}
  function run() external broadcast {
    address addr = vm.envAddress("Counter");
    uint value = vm.envUint("ARG0");
    Counter(addr).subtract(value);
  }
}
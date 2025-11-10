// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Script } from "vibe-core/Script.sol";
import { Counter } from "../src/Counter.sol";

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
  uint public _value = vm.envUint("_value");

  function run() external broadcast {
    address addr = vm.envAddress("Counter");
    Counter(addr).add(_value);
  }
}

contract Subtract is Script {
  uint public _value = vm.envUint("_value");

  function run() external broadcast {
    address addr = vm.envAddress("Counter");
    Counter(addr).subtract(_value);
  }
}
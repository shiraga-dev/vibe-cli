// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

contract Counter {
  uint public number;

  constructor (uint initialNumber) {
    number = initialNumber;
  }

  function setNumber(uint newNumber) public {
    number = newNumber;
  }

  function increment() public {
    number++;
  }

  function decrement() public {
    number--;
  }

  function add(uint value) public {
    number += value;
  }
  
  function subtract(uint value) public {
    number -= value;
  }
}
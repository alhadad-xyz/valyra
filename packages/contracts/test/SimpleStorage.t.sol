// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public simpleStorage;

    function setUp() public {
        simpleStorage = new SimpleStorage();
    }

    function testSetGetValue() public {
        uint256 testValue = 42;
        
        vm.expectEmit(true, false, false, true);
        emit SimpleStorage.ValueChanged(testValue);
        
        simpleStorage.setValue(testValue);
        assertEq(simpleStorage.getValue(), testValue);
    }
    
    function testSetGetValueFuzz(uint256 x) public {
        vm.expectEmit(true, false, false, true);
        emit SimpleStorage.ValueChanged(x);
        
        simpleStorage.setValue(x);
        assertEq(simpleStorage.getValue(), x);
    }
}

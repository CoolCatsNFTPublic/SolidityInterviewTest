# Cool Cats Solidity Test

This repo contains a number of mistakes and places where improvements can be made. Please make any adjustments you see fit.
We have deliberately made some very silly mistakes and simple things like file names might be wrong or inconsistent.

### ERC1155SupplyCC

Why was this file used and not used directly from the OpenZeppelin library?

Answer

It was modified for its usecase. So therefore a new file was created for this modification

A mapping of _totalsupply that maps token id to token amount was added;

A check function that checks if a token exist given its id

The _beforeTokenTransfer function that overrides the original function from the base contract.
This function increases the totalSupply if from address is address zero and reduces totalsupply if to address is address zero.


### Claim()

Please adjust the claim function so that an address can only claim once per day.

## Unit Tests

At Cool Cats we write unit tests for 100% coverage and for as many edge cases as we can think of. Please do the same here.

## Deployment Script/Task

Please create a deployment script or task. Which ever you feel is most appropriate

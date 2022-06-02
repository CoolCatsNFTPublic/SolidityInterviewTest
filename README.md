# Cool Cats Solidity Test

This repo contains a number of mistakes and places where improvements can be made. Please make any adjustments you see fit.
We have deliberately made some very silly mistakes and simple things like file names might be wrong or inconsistent.

### ERC1155SupplyCC

Why was this file used and not used directly from the OpenZeppelin library?

**Answer**

This is a customized contract has its own implemented extra features like:

- mapping "\_totalSupply" which maps id to number of tokens.
- "exists" function checks if the token exists given its id.
- "\_beforeTokenTransfer" function has conditional statements to regulate the supply of tokens based on the address.

### Claim()

Please adjust the claim function so that an address can only claim once per day.

## Unit Tests

At Cool Cats we write unit tests for 100% coverage and for as many edge cases as we can think of. Please do the same here.

## Deployment Script/Task

Please create a deployment script or task. Which ever you feel is most appropriate

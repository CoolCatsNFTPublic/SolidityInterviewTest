# Cool Cats Solidity Test

This repo contains a number of mistakes and places where improvements can be made. Please made any adjustments you see fit.
We have deliberately made some very silly mistakes and simple things like file names might be wrong or inconsistent.

### ERC1155SupplyCC

Why was this file used and not used directly from the OpenZeppling library?

asnwer:  to create new items (id) without having to deploy new contracts ( ERC1155) for each token seperatly.   

### Claim()

Please adjust the claim function so that an address can only claim once per day.

contract ItemFactory ---> line 11 , 47 , 110

## Unit Tests

At Cool Cats we write unit tests for 100% coverage and for as many edge cases as we can think of. Please do the same here.

contract mockTestContract 

test/test.ts

npx hardhat test
## Deployment Script/Task

Please create a deployment script or task. Which ever you feel is most appropriate


npx hardhat run --network localhost  deploy.ts

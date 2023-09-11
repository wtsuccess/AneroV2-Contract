import { ethers } from "hardhat";
import { getMerkleRoot } from "../utils/merkleTree";
import { AneroV2, AneroV2__factory } from "../typechain-types";

async function main() {
  const AneroV2: AneroV2__factory = await ethers.getContractFactory("AneroV2");
  const merkleRoot: string = getMerkleRoot();
  console.log("merkleRoot: ", merkleRoot);

  const baseURI: string = "ipfs/QmcZJ2AXhPAThF5qab1WHCzrPZmjTn6TfJvHB2hbDNqkb6";
  const aneroV2 = await AneroV2.deploy(merkleRoot, baseURI, 5, 6334);
  await aneroV2.waitForDeployment();
  console.log("aneroV2 deployed to:", await aneroV2.getAddress());
} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

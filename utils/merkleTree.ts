import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { ethers } from "hardhat";

import { leafNodes } from "../assets/holder";

const merkleTree = () => {
  const leaves: Buffer[] = leafNodes.map((i) => {
    const packed: string = ethers.solidityPacked(
      ["address", "uint256"],
      [i.owner, i.totalCount]
    );
    return keccak256(packed);
  });

  // Generate merkleTree from leafNodes
  const merkleTree: MerkleTree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
  });

  return merkleTree;
};

export const getMerkleRoot = () => {
  const tree: MerkleTree = merkleTree();
  // Get root hash from merkle tree
  const merkleRoot: string = tree.getHexRoot();
  return merkleRoot;
};

export const getMerkleProof = (address: string, amount: number) => {
  const tree: MerkleTree = merkleTree();
  const packed: string = ethers.solidityPacked(
    ["address", "uint256"],
    [address, amount]
  );
  const merkleProof: string[] = tree.getHexProof(keccak256(packed));
  return merkleProof;
};

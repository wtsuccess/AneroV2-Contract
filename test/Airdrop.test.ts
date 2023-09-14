import { expect } from "chai";
import { AneroV2, AneroV2__factory } from "../typechain-types";
import { ethers } from "hardhat";
import { getMerkleProof, getMerkleRoot } from "../utils/merkleTree";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Airdrop", async () => {
  let aenroV2: AneroV2;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async () => {
    const aenroV2Factory: AneroV2__factory = await ethers.getContractFactory(
      "AneroV2"
    );
    [owner, user] = await ethers.getSigners();

    const merkleRoot: string = getMerkleRoot();
    const baseURI: string =
      "ipfs/QmcZJ2AXhPAThF5qab1WHCzrPZmjTn6TfJvHB2hbDNqkb6";
    aenroV2 = await aenroV2Factory.deploy(merkleRoot, baseURI, 5, 6334);
    await aenroV2.waitForDeployment();
  });

  describe("Check interface", () => {
    it("Support Interfaces: ", async () => {
      // IERC2981
      expect(await aenroV2.supportsInterface("0x2a55205a")).to.eq(true);

      // IERC721
      expect(await aenroV2.supportsInterface("0x80ac58cd")).to.eq(true);
    })
  })

  describe("setMerkleRoot", () => {
    it("should be able to set merkleRoot", async () => {
      const newMerkleRoot: string =
        "0xc60b1a0f84bbe9a8e29067107511201876d7c16d54654187716e880efee3afd9";
      await expect(
        aenroV2.connect(user).setMerkleRoot(newMerkleRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await aenroV2.setMerkleRoot(newMerkleRoot);
      expect(await aenroV2.merkleRoot()).to.equals(newMerkleRoot);
    });
  });

  describe("mint", () => {
    it("should mint new amount of NFT", async () => {
      const holder: string = user.address;
      console.log('mint: ', holder)
      const wrongHolder: string = "0x001cd047fa72ee0d2a25068b8996b9901c4e6920";
      const amount: number = 7;
      const wrongHolderProof: string[] = getMerkleProof(wrongHolder, amount);
      const wrongAmountProof: string[] = getMerkleProof(holder, 5);
      const proof: string[] = getMerkleProof(holder, amount);
      await expect(aenroV2.mint(wrongHolderProof, amount)).to.be.revertedWith(
        "invalid proof"
      );
      await expect(aenroV2.mint(wrongAmountProof, 5)).to.be.revertedWith(
        "invalid proof"
      );

      await aenroV2.connect(owner).setPause(false);

      await aenroV2.connect(user).mint(proof, amount); // expected
      console.log("balance: ", await aenroV2.balanceOf(holder))
      expect(await aenroV2.balanceOf(holder)).to.equals(amount);
      await expect(
        aenroV2.connect(user).mint(proof, amount)
      ).to.be.revertedWith("Already claimed");
    });

    it("Admin mint",async () => {
      await aenroV2.setPause(false);
      await expect(aenroV2.mintAdmin(1000)).to.be.revertedWith("Pausable: not paused");
      await aenroV2.setPause(true);
      await expect(aenroV2.mintAdmin(6330)).to.be.reverted;
      await aenroV2.mintAdmin(2000);
      expect(await aenroV2.balanceOf(owner.address)).to.be.equal(2000);
    })
  });
});

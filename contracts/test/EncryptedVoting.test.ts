import { expect } from "chai";
import hre from "hardhat";
import type { EncryptedVoting } from "../typechain-types/contracts/EncryptedVoting";

const { cofhejs, Encryptable } = require("cofhejs/node");

describe("EncryptedVoting plugin behavior", function () {
  it("submits a product and exposes summary metadata", async function () {
    const { ethers } = hre;
    const [owner] = await ethers.getSigners();

    await hre.cofhe.expectResultSuccess(
      hre.cofhe.initializeWithHardhatSigner(owner, {
        environment: "MOCK",
        generatePermit: false,
      }),
    );

    const Factory = await ethers.getContractFactory("EncryptedVoting");
    const contract = (await Factory.connect(owner).deploy()) as unknown as EncryptedVoting;
    await contract.waitForDeployment();

    await expect(
      contract.connect(owner).submitProduct("ShipLens", "https://shiplens.example", "Launch analytics in one place"),
    ).to.not.be.reverted;

    expect(await contract.productCount()).to.equal(1n);

    const summary = await contract.getProductSummary(0n);
    expect(summary[0]).to.equal("ShipLens");
    expect(summary[1]).to.equal("https://shiplens.example");
    expect(summary[2]).to.equal("Launch analytics in one place");
    expect(summary[3]).to.equal(true);
    expect(summary[4]).to.equal(owner.address);
  });

  it("prevents the product owner from voting", async function () {
    const { ethers } = hre;
    const [owner] = await ethers.getSigners();

    await hre.cofhe.expectResultSuccess(
      hre.cofhe.initializeWithHardhatSigner(owner, {
        environment: "MOCK",
        generatePermit: false,
      }),
    );

    const Factory = await ethers.getContractFactory("EncryptedVoting");
    const contract = (await Factory.connect(owner).deploy()) as unknown as EncryptedVoting;
    await contract.waitForDeployment();

    await contract.connect(owner).submitProduct("ShipLens", "https://shiplens.example", "Launch analytics in one place");

    const encryptedVote = (await hre.cofhe.expectResultSuccess(
      cofhejs.encrypt([Encryptable.uint8(1n)]),
    )) as Array<{
      ctHash: bigint;
      securityZone: number;
      utype: number;
      signature: string;
    }>;

    await expect(
      contract.connect(owner).setEncryptedVoteState(0n, encryptedVote[0]),
    ).to.be.revertedWithCustomError(contract, "ProductOwnerCannotVote");
  });

  it("lets another wallet vote and stores plaintext 1 in mocks", async function () {
    const { ethers } = hre;
    const [owner, voter] = await ethers.getSigners();

    await hre.cofhe.expectResultSuccess(
      hre.cofhe.initializeWithHardhatSigner(voter, {
        environment: "MOCK",
        generatePermit: false,
      }),
    );

    const Factory = await ethers.getContractFactory("EncryptedVoting");
    const contract = (await Factory.connect(owner).deploy()) as unknown as EncryptedVoting;
    await contract.waitForDeployment();

    await contract.connect(owner).submitProduct("ShipLens", "https://shiplens.example", "Launch analytics in one place");

    const encryptedVote = (await hre.cofhe.expectResultSuccess(
      cofhejs.encrypt([Encryptable.uint8(1n)]),
    )) as Array<{
      ctHash: bigint;
      securityZone: number;
      utype: number;
      signature: string;
    }>;

    await expect(
      contract.connect(voter).setEncryptedVoteState(0n, encryptedVote[0]),
    ).to.not.be.reverted;

    expect(await contract.hasVotedForProduct(0n, voter.address)).to.equal(true);

    const ctHash = await contract.getEncryptedVoteCount(0n);
    await hre.cofhe.mocks.expectPlaintext(ctHash, 1n);
  });

  it("reverts on invalid product reads", async function () {
    const { ethers } = hre;
    const [owner] = await ethers.getSigners();

    await hre.cofhe.expectResultSuccess(
      hre.cofhe.initializeWithHardhatSigner(owner, {
        environment: "MOCK",
        generatePermit: false,
      }),
    );

    const Factory = await ethers.getContractFactory("EncryptedVoting");
    const contract = (await Factory.connect(owner).deploy()) as unknown as EncryptedVoting;
    await contract.waitForDeployment();

    await expect(contract.getPublicVoteCount(999n)).to.be.revertedWithCustomError(contract, "InvalidProduct");
  });
});

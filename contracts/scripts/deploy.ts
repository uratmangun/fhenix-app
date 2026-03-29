import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying EncryptedVoting with: ${deployer.address}`);
  console.log(`Network: ${network.name}`);

  const Factory = await ethers.getContractFactory("EncryptedVoting");
  const voting = await Factory.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`EncryptedVoting deployed at: ${address}`);

  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${network.name}.json`);
  const existing = fs.existsSync(deploymentPath)
    ? (JSON.parse(fs.readFileSync(deploymentPath, "utf8")) as Record<string, string>)
    : {};

  existing.EncryptedVoting = address;

  fs.writeFileSync(deploymentPath, JSON.stringify(existing, null, 2));
  console.log(`Saved deployment file to ${deploymentPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

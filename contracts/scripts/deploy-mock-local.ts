import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying EncryptedVotingMock with: ${deployer.address}`);
  console.log(`Network: ${network.name}`);

  const Factory = await ethers.getContractFactory("EncryptedVotingMock");
  const voting = await Factory.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log(`EncryptedVotingMock deployed at: ${address}`);

  const deploymentsDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, `${network.name}.json`);
  const existing = fs.existsSync(deploymentPath)
    ? (JSON.parse(fs.readFileSync(deploymentPath, "utf8")) as Record<string, string>)
    : {};

  existing.EncryptedVotingMock = address;

  fs.writeFileSync(deploymentPath, JSON.stringify(existing, null, 2));
  console.log(`Saved deployment file to ${deploymentPath}`);

  const localRegistryPath = path.join(process.cwd(), "..", "lib", "cloudflare", "local-contract-registry.json");
  const localRegistry = fs.existsSync(localRegistryPath)
    ? (JSON.parse(fs.readFileSync(localRegistryPath, "utf8")) as Record<string, string>)
    : {};

  localRegistry.EncryptedVotingMock = address;
  fs.writeFileSync(localRegistryPath, JSON.stringify(localRegistry, null, 2));
  console.log(`Saved local contract registry to ${localRegistryPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

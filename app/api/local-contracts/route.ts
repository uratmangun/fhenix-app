import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const registryPath = path.join(process.cwd(), "lib", "cloudflare", "local-contract-registry.json");

type Registry = {
  EncryptedVotingMock?: `0x${string}`;
  [key: string]: `0x${string}` | undefined;
};

export async function GET() {
  if (!fs.existsSync(registryPath)) {
    return NextResponse.json({ contracts: {} });
  }

  const contracts = JSON.parse(fs.readFileSync(registryPath, "utf8")) as Registry;
  return NextResponse.json({ contracts });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name: string; address: `0x${string}` };

  const current = fs.existsSync(registryPath)
    ? (JSON.parse(fs.readFileSync(registryPath, "utf8")) as Registry)
    : {};

  current[body.name] = body.address;
  fs.writeFileSync(registryPath, JSON.stringify(current, null, 2));

  return NextResponse.json({ ok: true, contracts: current });
}

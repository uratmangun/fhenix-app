import { arbitrumSepolia } from "wagmi/chains";

export const encryptedVotingAddresses = {
  [arbitrumSepolia.id]: {
    EncryptedVoting: (process.env.NEXT_PUBLIC_ENCRYPTED_VOTING_ADDRESS || "") as `0x${string}`,
  },
} as const;

export function getEncryptedVotingAddress(chainId?: number) {
  if (!chainId) {
    return undefined;
  }
  return encryptedVotingAddresses[chainId as keyof typeof encryptedVotingAddresses]?.EncryptedVoting;
}

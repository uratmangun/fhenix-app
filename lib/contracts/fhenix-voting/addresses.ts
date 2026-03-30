import { arbitrumSepolia } from "wagmi/chains";

export const encryptedVotingAddresses = {
  [arbitrumSepolia.id]: {
    EncryptedVoting: ((process.env.NEXT_PUBLIC_ENCRYPTED_VOTING_ADDRESS || "0xa28f103de761fbf88CE69Ac813A5F906F83c75f3") as `0x${string}`),
  },
} as const;

export function getEncryptedVotingAddress(chainId?: number) {
  if (!chainId) {
    return undefined;
  }
  return encryptedVotingAddresses[chainId as keyof typeof encryptedVotingAddresses]?.EncryptedVoting;
}

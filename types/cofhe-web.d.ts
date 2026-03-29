declare module "cofhejs/web" {
  export type CoFheInUint8 = {
    ctHash: bigint;
    securityZone: number;
    utype: number;
    signature: string;
  };

  export const Encryptable: {
    uint8: (value: bigint) => unknown;
  };

  export const cofhejs: {
    initializeWithViem: (params: {
      viemClient: unknown;
      viemWalletClient?: unknown;
      environment?: "MOCK" | "LOCAL" | "TESTNET" | "MAINNET";
    }) => Promise<
      | { success: true; data: unknown; error: null }
      | { success: false; data: null; error: { message: string } }
    >;
    encrypt: (items: readonly unknown[]) => Promise<
      | {
          success: true;
          data: readonly [CoFheInUint8, ...CoFheInUint8[]];
          error: null;
        }
      | {
          success: false;
          data: null;
          error: { message: string };
        }
    >;
  };
}

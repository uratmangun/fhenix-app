import { DurableObject } from "cloudflare:workers";

type ProductInsert = {
  productId: number;
  name: string;
  url: string;
  tagline: string;
  deadline: number;
  txHash?: string;
  blockNumber?: number;
  timestamp: number;
};

type ProductVoteInsert = {
  productId: number;
  voter: string;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: number;
};

type ProductFinalizationInsert = {
  productId: number;
  txHash: string;
  blockNumber: number;
  timestamp: number;
};

type SyncState = {
  chainId: number;
  contractAddress: string;
  fromBlock: number;
  toBlock: number;
  syncedAt: number;
  txHash: string;
};

declare global {
  interface CloudflareEnv {
    VOTE_INDEXER: DurableObjectNamespace<VoteIndexerDO>;
  }
}

export class VoteIndexerDO extends DurableObject<CloudflareEnv> {
  private readonly sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: CloudflareEnv) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.initializeSchema();
    });
  }

  private initializeSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        tagline TEXT NOT NULL,
        deadline INTEGER NOT NULL,
        created_tx_hash TEXT,
        created_block_number INTEGER,
        created_at INTEGER NOT NULL
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS product_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        voter TEXT NOT NULL,
        tx_hash TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        log_index INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE(tx_hash, log_index)
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS product_finalizations (
        product_id INTEGER PRIMARY KEY,
        tx_hash TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        finalized_at INTEGER NOT NULL
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS sync_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        chain_id INTEGER,
        contract_address TEXT,
        from_block INTEGER,
        to_block INTEGER,
        synced_at INTEGER,
        tx_hash TEXT
      )
    `);

    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_product_votes_product_id ON product_votes(product_id)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_product_votes_voter ON product_votes(voter)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_product_votes_block_number ON product_votes(block_number)");
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/sync") {
      const payload = (await request.json()) as {
        products?: ProductInsert[];
        votes?: ProductVoteInsert[];
        finalizations?: ProductFinalizationInsert[];
        syncState?: SyncState;
      };
      this.ingest(payload);
      return Response.json({ ok: true });
    }

    if (request.method === "POST" && url.pathname === "/products") {
      const payload = (await request.json()) as {
        productId: number;
        name: string;
        url: string;
        tagline: string;
        deadline: number;
        timestamp: number;
      };

      this.sql.exec(
        "INSERT OR REPLACE INTO products (product_id, name, url, tagline, deadline, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        payload.productId,
        payload.name,
        payload.url,
        payload.tagline,
        payload.deadline,
        payload.timestamp,
      );

      return Response.json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/products") {
      const products = this.sql
        .exec<{
          product_id: number;
          name: string;
          url: string;
          tagline: string;
          deadline: number;
          created_at: number;
        }>(
          "SELECT product_id, name, url, tagline, deadline, created_at FROM products ORDER BY product_id DESC",
        )
        .toArray();

      return Response.json({ products });
    }

    if (request.method === "GET" && url.pathname === "/index") {
      const productId = url.searchParams.get("productId");
      const voter = url.searchParams.get("voter");
      const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 500);
      const offset = Math.max(Number(url.searchParams.get("offset") || "0"), 0);

      const products = this.sql
        .exec<{
          product_id: number;
          name: string;
          url: string;
          tagline: string;
          deadline: number;
          created_tx_hash: string | null;
          created_block_number: number | null;
          created_at: number;
        }>(
          "SELECT product_id, name, url, tagline, deadline, created_tx_hash, created_block_number, created_at FROM products ORDER BY product_id DESC",
        )
        .toArray();

      let votes;
      if (productId) {
        votes = this.sql
          .exec<{
            product_id: number;
            voter: string;
            tx_hash: string;
            block_number: number;
            log_index: number;
            created_at: number;
          }>(
            "SELECT product_id, voter, tx_hash, block_number, log_index, created_at FROM product_votes WHERE product_id = ? ORDER BY block_number DESC, log_index DESC LIMIT ? OFFSET ?",
            Number(productId),
            limit,
            offset,
          )
          .toArray();
      } else if (voter) {
        votes = this.sql
          .exec<{
            product_id: number;
            voter: string;
            tx_hash: string;
            block_number: number;
            log_index: number;
            created_at: number;
          }>(
            "SELECT product_id, voter, tx_hash, block_number, log_index, created_at FROM product_votes WHERE lower(voter) = lower(?) ORDER BY block_number DESC, log_index DESC LIMIT ? OFFSET ?",
            voter,
            limit,
            offset,
          )
          .toArray();
      } else {
        votes = this.sql
          .exec<{
            product_id: number;
            voter: string;
            tx_hash: string;
            block_number: number;
            log_index: number;
            created_at: number;
          }>(
            "SELECT product_id, voter, tx_hash, block_number, log_index, created_at FROM product_votes ORDER BY block_number DESC, log_index DESC LIMIT ? OFFSET ?",
            limit,
            offset,
          )
          .toArray();
      }

      const finalizations = this.sql
        .exec<{ product_id: number; tx_hash: string; block_number: number; finalized_at: number }>(
          "SELECT product_id, tx_hash, block_number, finalized_at FROM product_finalizations ORDER BY block_number DESC",
        )
        .toArray();

      const sync =
        this.sql
          .exec<{
            chain_id: number | null;
            contract_address: string | null;
            from_block: number | null;
            to_block: number | null;
            synced_at: number | null;
            tx_hash: string | null;
          }>("SELECT chain_id, contract_address, from_block, to_block, synced_at, tx_hash FROM sync_state WHERE id = 1")
          .toArray()[0] ?? null;

      return Response.json({
        products,
        votes,
        finalizations,
        sync,
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private ingest(payload: {
    products?: ProductInsert[];
    votes?: ProductVoteInsert[];
    finalizations?: ProductFinalizationInsert[];
    syncState?: SyncState;
  }) {
    for (const product of payload.products ?? []) {
      this.sql.exec(
        "INSERT OR REPLACE INTO products (product_id, name, url, tagline, deadline, created_tx_hash, created_block_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        product.productId,
        product.name,
        product.url,
        product.tagline,
        product.deadline,
        product.txHash ?? null,
        product.blockNumber ?? null,
        product.timestamp,
      );
    }

    for (const vote of payload.votes ?? []) {
      this.sql.exec(
        "INSERT OR IGNORE INTO product_votes (product_id, voter, tx_hash, block_number, log_index, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        vote.productId,
        vote.voter,
        vote.txHash,
        vote.blockNumber,
        vote.logIndex,
        vote.timestamp,
      );
    }

    for (const finalization of payload.finalizations ?? []) {
      this.sql.exec(
        "INSERT OR REPLACE INTO product_finalizations (product_id, tx_hash, block_number, finalized_at) VALUES (?, ?, ?, ?)",
        finalization.productId,
        finalization.txHash,
        finalization.blockNumber,
        finalization.timestamp,
      );
    }

    if (payload.syncState) {
      this.sql.exec(
        "INSERT OR REPLACE INTO sync_state (id, chain_id, contract_address, from_block, to_block, synced_at, tx_hash) VALUES (1, ?, ?, ?, ?, ?, ?)",
        payload.syncState.chainId,
        payload.syncState.contractAddress,
        payload.syncState.fromBlock,
        payload.syncState.toBlock,
        payload.syncState.syncedAt,
        payload.syncState.txHash,
      );
    }
  }
}

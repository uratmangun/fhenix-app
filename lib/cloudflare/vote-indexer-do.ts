import { DurableObject } from "cloudflare:workers";

type VoteIndexInsert = {
  proposalId: number;
  voter: string;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: number;
};

type ProposalInsert = {
  proposalId: number;
  title: string;
  optionsCount: number;
  deadline: number;
  txHash: string;
  blockNumber: number;
  timestamp: number;
};

type FinalizationInsert = {
  proposalId: number;
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
      CREATE TABLE IF NOT EXISTS proposals (
        proposal_id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        options_count INTEGER NOT NULL,
        deadline INTEGER NOT NULL,
        created_tx_hash TEXT NOT NULL,
        created_block_number INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proposal_id INTEGER NOT NULL,
        voter TEXT NOT NULL,
        tx_hash TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        log_index INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE(tx_hash, log_index)
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS finalizations (
        proposal_id INTEGER PRIMARY KEY,
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

    this.sql.exec(
      "CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id)",
    );
    this.sql.exec(
      "CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter)",
    );
    this.sql.exec(
      "CREATE INDEX IF NOT EXISTS idx_votes_block_number ON votes(block_number)",
    );
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/sync") {
      const payload = (await request.json()) as {
        proposals?: ProposalInsert[];
        votes?: VoteIndexInsert[];
        finalizations?: FinalizationInsert[];
        syncState?: SyncState;
      };
      this.ingest(payload);
      return Response.json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/index") {
      const proposalId = url.searchParams.get("proposalId");
      const voter = url.searchParams.get("voter");
      const limit = Math.min(Number(url.searchParams.get("limit") || "100"), 500);
      const offset = Math.max(Number(url.searchParams.get("offset") || "0"), 0);

      const proposals = this.sql
        .exec<{
          proposal_id: number;
          title: string;
          options_count: number;
          deadline: number;
          created_tx_hash: string;
          created_block_number: number;
          created_at: number;
        }>(
          "SELECT proposal_id, title, options_count, deadline, created_tx_hash, created_block_number, created_at FROM proposals ORDER BY proposal_id DESC",
        )
        .toArray();

      let votes;
      if (proposalId) {
        votes = this.sql
          .exec<{
            proposal_id: number;
            voter: string;
            tx_hash: string;
            block_number: number;
            log_index: number;
            created_at: number;
          }>(
            "SELECT proposal_id, voter, tx_hash, block_number, log_index, created_at FROM votes WHERE proposal_id = ? ORDER BY block_number DESC, log_index DESC LIMIT ? OFFSET ?",
            Number(proposalId),
            limit,
            offset,
          )
          .toArray();
      } else if (voter) {
        votes = this.sql
          .exec<{
            proposal_id: number;
            voter: string;
            tx_hash: string;
            block_number: number;
            log_index: number;
            created_at: number;
          }>(
            "SELECT proposal_id, voter, tx_hash, block_number, log_index, created_at FROM votes WHERE lower(voter) = lower(?) ORDER BY block_number DESC, log_index DESC LIMIT ? OFFSET ?",
            voter,
            limit,
            offset,
          )
          .toArray();
      } else {
        votes = this.sql
          .exec<{
            proposal_id: number;
            voter: string;
            tx_hash: string;
            block_number: number;
            log_index: number;
            created_at: number;
          }>(
            "SELECT proposal_id, voter, tx_hash, block_number, log_index, created_at FROM votes ORDER BY block_number DESC, log_index DESC LIMIT ? OFFSET ?",
            limit,
            offset,
          )
          .toArray();
      }

      const finalizations = this.sql
        .exec<{ proposal_id: number; tx_hash: string; block_number: number; finalized_at: number }>(
          "SELECT proposal_id, tx_hash, block_number, finalized_at FROM finalizations ORDER BY block_number DESC",
        )
        .toArray();

      const sync = this.sql
        .exec<{
          chain_id: number | null;
          contract_address: string | null;
          from_block: number | null;
          to_block: number | null;
          synced_at: number | null;
          tx_hash: string | null;
        }>(
          "SELECT chain_id, contract_address, from_block, to_block, synced_at, tx_hash FROM sync_state WHERE id = 1",
        )
        .toArray()[0] ?? null;

      return Response.json({
        proposals,
        votes,
        finalizations,
        sync,
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private ingest(payload: {
    proposals?: ProposalInsert[];
    votes?: VoteIndexInsert[];
    finalizations?: FinalizationInsert[];
    syncState?: SyncState;
  }) {
    for (const proposal of payload.proposals ?? []) {
      this.sql.exec(
        "INSERT OR REPLACE INTO proposals (proposal_id, title, options_count, deadline, created_tx_hash, created_block_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        proposal.proposalId,
        proposal.title,
        proposal.optionsCount,
        proposal.deadline,
        proposal.txHash,
        proposal.blockNumber,
        proposal.timestamp,
      );
    }

    for (const vote of payload.votes ?? []) {
      this.sql.exec(
        "INSERT OR IGNORE INTO votes (proposal_id, voter, tx_hash, block_number, log_index, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        vote.proposalId,
        vote.voter,
        vote.txHash,
        vote.blockNumber,
        vote.logIndex,
        vote.timestamp,
      );
    }

    for (const finalization of payload.finalizations ?? []) {
      this.sql.exec(
        "INSERT OR REPLACE INTO finalizations (proposal_id, tx_hash, block_number, finalized_at) VALUES (?, ?, ?, ?)",
        finalization.proposalId,
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

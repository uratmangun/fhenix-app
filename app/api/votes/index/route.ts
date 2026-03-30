import { NextResponse } from "next/server";

import { execute, initializeDb, queryAll, queryOne } from "@/lib/db/client";

type ProductInsert = {
  productId: number;
  name: string;
  url: string;
  tagline: string;
  description: string;
  owner: string;
  timestamp: number;
};

type VoteUpdate = {
  productId: number;
  voter: string;
  voted: boolean;
  timestamp: number;
};

type CommentInsert = {
  productId: number;
  author: string;
  body: string;
  timestamp: number;
};

type ProductRow = {
  product_id: number;
  name: string;
  url: string;
  tagline: string;
  description: string;
  owner: string;
  created_at: number;
};

type CommentRow = {
  id: number;
  product_id: number;
  author: string;
  body: string;
  created_at: number;
};

type VoteCountRow = {
  count: number | string | bigint;
};

type VoteRow = {
  voted: number | boolean;
};

function asNumber(value: number | string | bigint | undefined) {
  return Number(value ?? 0);
}

function asBoolean(value: number | boolean | undefined) {
  if (typeof value === "boolean") {
    return value;
  }

  return Number(value ?? 0) === 1;
}

async function getVoteCount(productId: number) {
  const row = await queryOne<VoteCountRow>(
    "SELECT count(*) AS count FROM product_votes WHERE product_id = ? AND voted = 1",
    [productId],
  );

  return asNumber(row?.count);
}

async function getHasVoted(productId: number, voter?: string) {
  if (!voter) {
    return false;
  }

  const row = await queryOne<VoteRow>(
    "SELECT voted FROM product_votes WHERE product_id = ? AND voter = ?",
    [productId, voter],
  );

  return asBoolean(row?.voted);
}

export async function GET(request: Request) {
  await initializeDb();

  const url = new URL(request.url);
  const voter = url.searchParams.get("voter")?.toLowerCase();
  const productId = url.searchParams.get("productId");

  if (productId) {
    const targetProductId = Number(productId);
    const product = await queryOne<ProductRow>(
      "SELECT product_id, name, url, tagline, description, owner, created_at FROM products WHERE product_id = ?",
      [targetProductId],
    );

    if (!product) {
      return NextResponse.json({ product: null, comments: [] });
    }

    const voteCount = await getVoteCount(product.product_id);
    const hasVoted = await getHasVoted(product.product_id, voter);
    const comments = await queryAll<CommentRow>(
      "SELECT id, product_id, author, body, created_at FROM product_comments WHERE product_id = ? ORDER BY id DESC",
      [product.product_id],
    );

    return NextResponse.json({
      product: {
        product_id: product.product_id,
        name: product.name,
        url: product.url,
        tagline: product.tagline,
        description: product.description,
        owner: product.owner,
        created_at: product.created_at,
        vote_count: voteCount,
        has_voted: hasVoted,
      },
      comments: comments.map((comment) => ({
        id: comment.id,
        product_id: comment.product_id,
        author: comment.author,
        body: comment.body,
        created_at: comment.created_at,
      })),
    });
  }

  const products = await queryAll<ProductRow>(
    "SELECT product_id, name, url, tagline, description, owner, created_at FROM products ORDER BY product_id DESC",
  );

  const result = await Promise.all(
    products.map(async (product) => ({
      product_id: product.product_id,
      name: product.name,
      url: product.url,
      tagline: product.tagline,
      description: product.description,
      owner: product.owner,
      created_at: product.created_at,
      vote_count: await getVoteCount(product.product_id),
      has_voted: await getHasVoted(product.product_id, voter),
    })),
  );

  return NextResponse.json({ products: result });
}

export async function POST(request: Request) {
  await initializeDb();

  const body = (await request.json()) as ProductInsert | CommentInsert;

  if ("author" in body) {
    await execute(
      "INSERT INTO product_comments (product_id, author, body, created_at) VALUES (?, ?, ?, ?)",
      [body.productId, body.author, body.body, body.timestamp],
    );

    return NextResponse.json({ ok: true });
  }

  const existing = await queryOne<{ product_id: number }>(
    "SELECT product_id FROM products WHERE product_id = ?",
    [body.productId],
  );

  if (existing) {
    await execute(
      "UPDATE products SET name = ?, url = ?, tagline = ?, description = ?, owner = ?, created_at = ? WHERE product_id = ?",
      [body.name, body.url, body.tagline, body.description, body.owner, body.timestamp, body.productId],
    );
  } else {
    await execute(
      "INSERT INTO products (product_id, name, url, tagline, description, owner, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [body.productId, body.name, body.url, body.tagline, body.description, body.owner, body.timestamp],
    );
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  await initializeDb();

  const body = (await request.json()) as VoteUpdate;
  const existing = await queryOne<{ product_id: number }>(
    "SELECT product_id FROM product_votes WHERE product_id = ? AND voter = ?",
    [body.productId, body.voter],
  );

  if (existing) {
    await execute(
      "UPDATE product_votes SET voted = ?, updated_at = ? WHERE product_id = ? AND voter = ?",
      [body.voted ? 1 : 0, body.timestamp, body.productId, body.voter],
    );
  } else {
    await execute(
      "INSERT INTO product_votes (product_id, voter, voted, updated_at) VALUES (?, ?, ?, ?)",
      [body.productId, body.voter, body.voted ? 1 : 0, body.timestamp],
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await initializeDb();

  await execute("DELETE FROM product_comments");
  await execute("DELETE FROM product_votes");
  await execute("DELETE FROM products");

  return NextResponse.json({ ok: true });
}

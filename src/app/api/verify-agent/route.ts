import { NextResponse } from "next/server";
import { fetchAgentRegistryRecord } from "@/lib/agentRegistry";
import { verifyEnsip25Sepolia } from "@/lib/ensip25";
import { sepoliaPublicClient } from "@/lib/ens";

type Body = { artistEns: string; agentId: string };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const artistEns = body.artistEns?.trim();
  const agentId = body.agentId?.trim() || "1";
  if (!artistEns) {
    return NextResponse.json({ error: "artistEns required" }, { status: 400 });
  }

  const loaded = await fetchAgentRegistryRecord(agentId, artistEns);
  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.error }, { status: 502 });
  }

  const result = await verifyEnsip25Sepolia(sepoliaPublicClient, {
    registryAddress: loaded.address,
    record: loaded.record,
    artistEns,
  });

  return NextResponse.json({
    ...result,
    registrySource: loaded.source,
  });
}

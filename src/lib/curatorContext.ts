export type CuratorContext = {
  artistEns: string;
  artistStatement: string;
  curatorEns: string;
  curatorPitch: string;
  artSalesEth: number;
  collectorCount: number;
  contracts: string[];
  /** ENSIP-25 headline from /api/verify-agent (optional) */
  agentEnsip25Headline?: string;
  agentEnsip25Verified?: boolean;
};

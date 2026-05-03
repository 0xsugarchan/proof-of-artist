import type { Address } from "viem";

/** Deterministic mock metrics for hackathon demo (not real sales data). */
export function mockMetricsForContracts(contracts: Address[]) {
  let artSalesEth = 0;
  let collectors = 0;
  let topSaleEth = 0;

  for (const c of contracts) {
    const h = hashHex(c);
    artSalesEth += 0.5 + (h % 4200) / 1000;
    collectors += 8 + (h % 120);
    const sale = 0.08 + (h % 8000) / 2000;
    topSaleEth = Math.max(topSaleEth, sale);
  }

  if (contracts.length === 0) {
    return {
      artSalesGeneratedEth: 0,
      collectorCount: 0,
      topSaleEth: 0,
      featured: [] as { id: string; title: string; thumb: string }[],
    };
  }

  const featured = contracts.slice(0, 3).map((c, i) => {
    const h = hashHex(c + String(i));
    return {
      id: `${c}-${i}`,
      title: `Work ${1 + (h % 99)}`,
      thumb: gradientThumb(h),
    };
  });

  return {
    artSalesGeneratedEth: round2(artSalesEth),
    collectorCount: collectors,
    topSaleEth: round2(topSaleEth),
    featured,
  };
}

function hashHex(addr: string): number {
  let n = 0;
  for (let i = 2; i < addr.length; i += 3) {
    n = (n + addr.charCodeAt(i) * (i % 7)) % 100000;
  }
  return n;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function gradientThumb(seed: number) {
  const a = 40 + (seed % 60);
  const b = 120 + (seed % 80);
  const c = 200 + (seed % 55);
  return `linear-gradient(135deg, rgb(${a},${b},${c}), rgb(${c},${a + 20},${b}))`;
}

/**
 * 根据感知哈希做相似分组（纯逻辑，webview / extension 都可复用）。
 */

export interface HashItem {
  /** 完整文件路径，用作唯一键 */
  completePath: string;
  hash: string;
}

export interface SimilarGroupMember<T extends HashItem> {
  item: T;
  /** 与组内代表项（第一项）的汉明距离 */
  distance: number;
}

export interface SimilarGroup<T extends HashItem> {
  members: SimilarGroupMember<T>[];
}

/** 两个十六进制哈希的汉明距离 */
export function hammingDistance(hashA: string, hashB: string): number {
  let x = BigInt(`0x${hashA}`) ^ BigInt(`0x${hashB}`);
  let count = 0;
  while (x > 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

/**
 * 用并查集把汉明距离 ≤ threshold 的图片归为同一组。
 * 只返回成员数 ≥ 2 的组；组内按与代表项距离升序排列。
 */
export function groupSimilarImages<T extends HashItem>(
  items: T[],
  threshold: number
): SimilarGroup<T>[] {
  const n = items.length;
  if (n < 2) {
    return [];
  }

  const parent = Array.from({ length: n }, (_, i) => i);

  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };

  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[rb] = ra;
    }
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (hammingDistance(items[i].hash, items[j].hash) <= threshold) {
        union(i, j);
      }
    }
  }

  const buckets = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const list = buckets.get(root);
    if (list) {
      list.push(i);
    } else {
      buckets.set(root, [i]);
    }
  }

  const groups: SimilarGroup<T>[] = [];
  for (const indices of buckets.values()) {
    if (indices.length < 2) {
      continue;
    }
    const representative = items[indices[0]];
    const members: SimilarGroupMember<T>[] = indices
      .map((idx) => ({
        item: items[idx],
        distance: hammingDistance(representative.hash, items[idx].hash),
      }))
      .sort((a, b) => a.distance - b.distance || a.item.completePath.localeCompare(b.item.completePath));
    groups.push({ members });
  }

  // 组越大越靠前；同大小按路径排
  groups.sort((a, b) => {
    if (b.members.length !== a.members.length) {
      return b.members.length - a.members.length;
    }
    return a.members[0].item.completePath.localeCompare(
      b.members[0].item.completePath
    );
  });

  return groups;
}

// =============================================================================
// Time Verification - Provably Fair Time Tracking (Blockchain-verified)
// =============================================================================
//
// How it works:
// 1. Each time entry gets a SHA-256 hash of its data (verificationHash)
// 2. Daily, all entries are combined into a Merkle tree
// 3. The Merkle root is anchored to Polygon (~$0.001/tx)
// 4. Clients can verify any entry against the root
//
// =============================================================================

import { createHash } from "crypto"

// =============================================================================
// Hash Generation
// =============================================================================

interface TimeEntryData {
  userId: string
  projectId: string
  startTime: Date
  endTime: Date | null
  durationMinutes: number
  description: string | null
  taskId: string | null
}

/**
 * Generate a SHA-256 verification hash for a time entry
 * This hash proves the entry data at the time of creation/update
 */
export function generateTimeEntryHash(entry: TimeEntryData): string {
  const data = JSON.stringify({
    userId: entry.userId,
    projectId: entry.projectId,
    startTime: entry.startTime.toISOString(),
    endTime: entry.endTime?.toISOString() || null,
    durationMinutes: entry.durationMinutes,
    description: entry.description,
    taskId: entry.taskId,
    // Include timestamp to prevent replay
    generatedAt: new Date().toISOString(),
  })

  return createHash("sha256").update(data).digest("hex")
}

// =============================================================================
// Merkle Tree Implementation
// =============================================================================

/**
 * Build a Merkle tree from an array of hashes
 * Returns the root hash and proof paths for each leaf
 */
export function buildMerkleTree(hashes: string[]): {
  root: string
  proofs: Map<string, string[]>
} {
  if (hashes.length === 0) {
    return { root: "", proofs: new Map() }
  }

  if (hashes.length === 1) {
    return {
      root: hashes[0],
      proofs: new Map([[hashes[0], []]]),
    }
  }

  // Pad to even number if needed
  const leaves = [...hashes]
  if (leaves.length % 2 !== 0) {
    leaves.push(leaves[leaves.length - 1])
  }

  // Build tree level by level
  const proofs = new Map<string, string[]>()
  hashes.forEach((hash) => proofs.set(hash, []))

  let currentLevel = leaves

  while (currentLevel.length > 1) {
    const nextLevel: string[] = []

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i]
      const right = currentLevel[i + 1]
      const parent = hashPair(left, right)
      nextLevel.push(parent)

      // Update proofs for all leaves under these nodes
      for (const [leaf, proof] of proofs.entries()) {
        const leafIndex = currentLevel.indexOf(leaf)
        if (leafIndex === -1) continue

        if (leafIndex === i) {
          proof.push(right)
        } else if (leafIndex === i + 1) {
          proof.push(left)
        }
      }
    }

    // Update level tracking
    currentLevel = nextLevel
  }

  return {
    root: currentLevel[0],
    proofs,
  }
}

/**
 * Hash two values together (for Merkle tree nodes)
 */
function hashPair(left: string, right: string): string {
  // Sort to ensure consistent ordering
  const combined = left < right ? left + right : right + left
  return createHash("sha256").update(combined).digest("hex")
}

/**
 * Verify a leaf hash against a Merkle root using a proof
 */
export function verifyMerkleProof(
  leafHash: string,
  proof: string[],
  root: string
): boolean {
  let currentHash = leafHash

  for (const sibling of proof) {
    currentHash = hashPair(currentHash, sibling)
  }

  return currentHash === root
}

// =============================================================================
// Polygon Anchoring
// =============================================================================

interface AnchorResult {
  txHash: string
  chainId: number
  blockNumber?: number
}

/**
 * Anchor a Merkle root to Polygon
 * Uses a simple data transaction to store the hash on-chain
 *
 * Note: Requires ethers.js to be installed (npm install ethers)
 * For MVP without blockchain, this returns null and entries are still tracked locally
 */
export async function anchorToPolygon(
  merkleRoot: string,
  date: Date,
  entryCount: number
): Promise<AnchorResult | null> {
  // Check if we have Polygon config
  const privateKey = process.env.POLYGON_PRIVATE_KEY
  const rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com"

  if (!privateKey) {
    console.log("[TimeVerification] Polygon not configured, skipping anchor")
    return null
  }

  try {
    // Dynamic import ethers only when needed
    // ethers must be installed separately: npm install ethers
    // Using global require to avoid TypeScript module resolution at compile time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethersModule: any = await new Promise((resolve) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        resolve(require("ethers"))
      } catch {
        resolve(null)
      }
    })

    if (!ethersModule) {
      console.log("[TimeVerification] ethers.js not installed, skipping anchor")
      console.log("[TimeVerification] Install with: npm install ethers")
      return null
    }

    const provider = new ethersModule.JsonRpcProvider(rpcUrl)
    const wallet = new ethersModule.Wallet(privateKey, provider)

    // Create data payload
    const data = ethersModule.toUtf8Bytes(
      JSON.stringify({
        type: "NERVE_AGENT_TIME_ANCHOR",
        merkleRoot,
        date: date.toISOString().split("T")[0],
        entryCount,
        timestamp: new Date().toISOString(),
      })
    )

    // Send transaction to self with data
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      data: ethersModule.hexlify(data),
    })

    const receipt = await tx.wait()

    return {
      txHash: tx.hash,
      chainId: 137, // Polygon mainnet
      blockNumber: receipt?.blockNumber,
    }
  } catch (error) {
    console.error("[TimeVerification] Polygon anchor failed:", error)
    return null
  }
}

// =============================================================================
// Verification Utilities
// =============================================================================

/**
 * Get Polygonscan URL for a transaction
 */
export function getPolygonscanUrl(txHash: string): string {
  return `https://polygonscan.com/tx/${txHash}`
}

/**
 * Format verification status for display
 */
export function getVerificationStatus(
  entry: {
    verificationHash: string | null
    anchoredAt: Date | null
    anchorTxHash: string | null
  }
): {
  status: "unverified" | "hashed" | "anchored"
  label: string
  txUrl: string | null
} {
  if (entry.anchorTxHash && entry.anchoredAt) {
    return {
      status: "anchored",
      label: "✓ Verified on Polygon",
      txUrl: getPolygonscanUrl(entry.anchorTxHash),
    }
  }

  if (entry.verificationHash) {
    return {
      status: "hashed",
      label: "Pending verification",
      txUrl: null,
    }
  }

  return {
    status: "unverified",
    label: "Not verified",
    txUrl: null,
  }
}

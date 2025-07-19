

# Stage 1 – Pre‑Flight Gate

The **Pre‑Flight Gate** is the first layer in our address‑validation pipeline. Its sole responsibility is to reject input that is *obviously not an address* before we perform any CPU‑heavy searches or pay external geocoding fees.  
Keeping this gate extremely fast (< 1 ms median) protects downstream latency, reduces cost, and simplifies operational telemetry by ensuring only “address‑ish” strings reach later stages.

---

## Objectives

| Goal | Why it matters |
|------|----------------|
| **Fail fast on junk** | Drops emoji spam, random sentences, or payloads that are far too long/short. |
| **Lightweight heuristics only** | Runs in micro‑seconds with no 3rd‑party calls, so it never becomes the bottleneck. |
| **Produce structured signals** | Marks borderline inputs (`low_confidence`) so later stages can decide to escalate or ask for user correction. |

---

## Functional Flow

1. **Sanitise**  
   * Trim leading/trailing whitespace, collapse multiple spaces.  
   * Lower‑case and strip control characters / emoji to avoid noise.

2. **Length & Charset Guards**  
   * Reject if the string is shorter than five characters or exceeds 512 characters.  
   * Reject if it contains no alpha‑numeric characters after sanitisation.

3. **Fast‑path Regex**  
   * Accept immediately when we find either:  
     * a 5‑digit (or 5‑plus‑4) ZIP code, **or**  
     * a leading house number followed by at least one word token.  
   * These two patterns cover ~90 % of valid U.S. addresses.

4. **Lightweight Classifier**  
   * If regex did **not** pass, calculate a cheap “address‑likeness” score using six features (digit ratio, street‑suffix presence, ZIP presence, etc.).  
   * Implemented as a logistic regression that runs in a single dot‑product—no ML runtime required.  
   * Outcomes:  
     * **p ≥ 0.60** → treat as valid; proceed to Stage 2.  
     * **0.35 ≤ p < 0.60** → proceed, but flag `low_confidence`.  
     * **p < 0.35** → reject with `422 invalid_format`.

---

## Inputs & Outputs

```jsonc
// Request body (excerpt)
{
  "raw": "1234 mian st boston ma 02111"
}

// Pre‑Flight response object
{
  "ok": true,
  "flag": "low_confidence"   // optional
}
```

*Rejected* inputs receive an HTTP 422 or 413 with an error code explaining the reason.

---

## Design Rationale

* **Speed:** 100 % in‑memory string operations → sub‑millisecond even under load.  
* **Cost:** No external services, no heavy ML; the log‑reg weights are baked into the binary.  
* **Observability:** Emits metrics (`preflight_pass`, `preflight_fail`, `preflight_low_conf`) so we can spot unusual spikes in junk traffic or user‑input mistakes.  
* **Future‑proof:** If we later support non‑U.S. addresses, we only need to tweak the regex and retrain the classifier—Stage 1’s contract remains unchanged.
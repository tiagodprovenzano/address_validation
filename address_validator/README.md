# Address Validator

A lightweight, typo-tolerant micro-service that parses, validates and standardises US property addresses.

Technologies
------------
- **NestJS** – HTTP API (`POST /validate-address`)
- **libpostal** – address parsing
- **Google Geocoding API** – authoritative validation & canonical form
- **Ollama + Qwen 3 0.6 B** – local LLM used for spell-fixing + fuzzy matching
- **Docker Compose** – one-command spin-up (libpostal, Ollama, API)

Validation Workflow
-------------------
```text
┌────────────┐   1. parse           ┌────────────────────────┐
│  raw input │────────────────────►│   libpostal (parser)    │
└────────────┘                      └─────────┬──────────────┘
                                              │parsedInput
                                              ▼
                                   2. google geocode (raw)
                                              │
               ┌────────────── yes ───────────┘ if every filled
               │                                     component matches
               │                             status = VALID
               ▼ no
      3. Qwen spell-fix            4. google geocode (corrected)
               │                                 │
               └──── yes, matches ───────────────┘ → status = CORRECTED
               │
               └─► 5. Qwen "same addr?" check against google
                           │yes → status = CORRECTED
                           │no  → status = UNVERIFIABLE
```

Response Shape
--------------
```jsonc
{
  "valid": true,
  "status": "VALID",          // or CORRECTED / UNVERIFIABLE
  "similarity": 100,          // reserved for future use
  "match": {
    "canonical": "777 Brockton Ave, Abington, MA 02351, USA",
    "latitude": 42.1043,
    "longitude": -70.9459,
    "components": {
      "house_number": "777",
      "road": "brockton ave",
      "city": "abington",
      "state": "ma",
      "postcode": "02351"
    }
  }
}
```

Running Locally
---------------
1. **Prerequisites** – Docker ≥ 24.
2. **Google key** – create `.env` in `address_validator/` with:
   ```bash
   GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
   ```
3. **Start in dev mode** (auto-reload):
   ```bash
   docker compose --profile dev up --build
   ```
   The first run pulls the `qwen3:0.6b` model (~2 GB) automatically.
4. **Hit the API**:
   ```bash
   curl -X POST localhost:3001/validate-address \
     -H "Content-Type: application/json" \
     -d '{"address":"777 Brockton Ave, Abington MA 2351"}' | jq
   ```

🧪  Test Cases
--------------
| Input                                           | Expected status |
|-------------------------------------------------|-----------------|
| `2173 Bluff Rd, Indianapolis, IN 46225`         | VALID           |
| `2173 Blufdf Rd, Indianapolis, IN 46225`        | CORRECTED       |
| `123 Tiago Rd, NY`                              | UNVERIFIABLE    |
| `777 Brockton Ave, Abinggton MA 2351`           | CORRECTED       |

Editing & Hot Reload
--------------------
`api-dev` service runs `npm run dev`; changes under `address_validator/src` trigger recompilation. Use the `dev` profile when you need instant feedback:
```bash
docker compose --profile dev up --build
```

Production Build
----------------
```bash
docker compose up --build  # default prod profile
```

Contributing
------------
PRs welcome! Please run `npm run lint` and add/adjust unit tests.

## Google Maps API Key
Google Geocoding requests require a valid key. Create a free key in the Google Cloud Console (enable *Geocoding API*).  
Store it in a local `.env` file **inside** the `address_validator/` directory so Docker can load it at runtime:

```bash
# address_validator/.env
GOOGLE_MAPS_API_KEY=YOUR_REAL_KEY
```

> Tip: restrict the key to *Geocoding API* and the IP range you’ll run from to avoid unexpected usage.


| TYPE        | NAME                       | LINK                                                       | Comment                                                         |
| ----------- | -------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| ai          | **Ollama**                 |                                                            | Local LLM runtime, shared across stacks via the `internal-llm` network |
| ai          | **Open WebUI**             |                                                            | Chat UI for Ollama                                               |
| application | **link warden**            |                                                            | Link/bookmark management                                        |
| application | **paperless-ngx**          |                                                            | Document scanning, OCR, search                                  |
| application | **paperless-ai**           |                                                            | AI-assisted tagging for paperless-ngx, via Ollama over `internal-llm` |
| application | **paperless-gpt**          |                                                            | AI-assisted OCR summaries/tagging for paperless-ngx, via Ollama over `internal-llm` |
| application | **beets**                  |                                                            | works with music-picard to manage audio library                 |
| application | ?? **pdf-editor-stirling** |                                                            | suite of easy to use pdf editing stuff                          |
| connection  | **cloudflare**             |                                                            | outside ip connection                                           |
| media       | **kavita**                 |                                                            | ebooks, comics, manga                                           |
| media       | **jellyfin**               |                                                            | videos                                                          |
| media       | **plex (local-only)**      |                                                            | videos (ps5 support)                                            |
| media       | **audiobookshelf**         | https://audiobookshelf.org/docs/documentation/introduction | audio books, podcasts                                           |
| media       | **Navidrome**              | https://www.navidrome.org/docs/overview/                   | For music management                                            |
| media       | **Stash**                  |                                                            | Adult media library                                             |
| media       | **Immich**                 | https://immich.app/docs                                    | Photo/video backup & management, CPU-only smart search, no Ollama integration (native) |
| monitoring  | **Scrutiny**               |                                                            | Hard drive S.M.A.R.T. health monitoring (alerts on degradation) |
| monitoring  | **Netdata**                |                                                            | Real-time system metrics (CPU, RAM, disk, temperature)          |
| monitoring  | **Glances**                |                                                            | Lightweight network monitoring                                  |
| monitoring  | **Dozzle**                 |                                                            | Web-based viewer for docker container logs                      |
| monitoring  | **vnstat**                 |                                                            | Long-term bandwidth accounting (daily/monthly totals), not real-time |
| security    | **Fail2ban**               |                                                            | Blocks IP addresses after repeated failed login attempts        |

## Network strategy

- One compose file per app/stack (current layout) — Compose gives each its
  own isolated default network automatically, so e.g. Linkwarden's postgres
  is never reachable from Kavita's container. Keep doing this; don't merge
  stacks into one giant compose file.
- One shared external network, `edge`, for anything that should be reachable
  through the Cloudflare tunnel. Create it once: `docker network create edge`.
  `cloudflared` joins only `edge`. Any app that needs a public hostname joins
  `edge` too (in addition to its own stack's default network).
- Backend/db containers (postgres, redis, meilisearch, etc.) never join
  `edge` — only the app container in front of them does. If a service is
  multi-container, put the exposed one on `edge` and leave the rest on
  `default` only.
- Local-only or sensitive apps (Plex, Stash, all of `monitoring/`, Fail2ban)
  never join `edge`, full stop. If one of these ever needs remote access,
  add it deliberately rather than exposing it by default.
- `connection/caddy/caddy.yaml` (Caddy) sits on `edge` between `cloudflared` and
  every app. `cloudflared`'s tunnel config routes one wildcard hostname to
  Caddy; all per-app hostname routing lives in `connection/Caddyfile`
  instead. Adding a new public app = add a block to the Caddyfile, nothing
  to touch in the tunnel config or Cloudflare dashboard.
- A second shared external network, `internal-llm`, for internal-only
  (never tunneled) cross-stack traffic to Ollama. Create it once:
  `docker network create internal-llm`. `ai/ollama.yaml` joins it; so do
  `paperless-ai`/`paperless-gpt` in `organization/paperless-ngx.yaml` — this
  lets those stacks reach Ollama without merging compose projects or
  making Ollama a hard dependency of paperless-ngx.
- Every compose file sets an explicit top-level `name:` matching its app
  (e.g. `name: jellyfin`), so Compose project names — and therefore each
  stack's default network — can't collide even when multiple files share a
  directory and no `-p` flag is passed.
- Every service's `environment:` lives in a sibling `<name>.env` file,
  loaded via `env_file:`. Editing a value (a path, a secret, a hostname)
  only ever touches the `.env` file, never the compose YAML.


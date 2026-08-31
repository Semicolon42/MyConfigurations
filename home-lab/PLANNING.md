
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
| dashboard   | **Homepage**               | https://gethomepage.dev/                                   | Landing page/links + live widgets for every app in the lab       |
| dashboard   | **Portainer**              | https://docs.portainer.io/                                 | GUI for managing containers/stacks (start/stop/logs/deploy)     |
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

## Port scheme

Every published host port follows `<category><app>`, where category is a
fixed 4-digit prefix (10 slots per category, `X` = app index within it) and
app root folders map to categories 1:1:

| Category     | Prefix  | Root folder   |
| ------------ | ------- | ------------- |
| dashboard    | `1000X` | `dashboard/`  |
| monitoring   | `1001X` | `monitoring/` |
| connection   | `1002X` | `connection/` |
| security     | `1003X` | `security/`   |
| media        | `2000X` | `media/`      |
| organization | `2001X` | `organization/` |
| ai           | `3000X` | `ai/`         |

A new app takes the next free `X` in its category's range. Exception: Plex
(`media/plex-local-only/`) stays pinned to `32400:32400` instead of a `2000X`
port — its LAN auto-discovery (GDM), which the PS5 app depends on, only
works on the standard port.

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
- Local-only or sensitive apps (Plex, Stash, all of `monitoring/`, Fail2ban,
  all of `dashboard/`) never join `edge`, full stop. Homepage links every
  internal hostname in one place and Portainer holds a read-write docker
  socket, so both stay LAN-only by default. If one of these ever needs
  remote access, add it deliberately rather than exposing it by default.
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
- Volume host paths use one `___REPLACE_ME_<APP>_ROOT_PATH___` placeholder
  per app, with the literal scaffold-folder name (mirrored from the NAS,
  tracked here via `.gitkeep`) appended on each volume line — e.g.
  `___REPLACE_ME_NETDATA_ROOT_PATH___/config:/etc/netdata`. Shared/external
  paths that don't live under the app's private root (media libraries, log
  sources to watch, raw disk devices) keep their own distinct
  `___REPLACE_ME_..._PATH___` placeholder instead.



| TYPE        | NAME                       | LINK                                                       | Comment                                                         |
| ----------- | -------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| application | **link warden**            |                                                            | Link/bookmark management                                        |
| application | **paperless-ngx**          |                                                            | Document scanning, OCR, search                                  |
| application | **beets**                  |                                                            | works with music-picard to manage audio library                 |
| application | ?? **pdf-editor-stirling** |                                                            | suite of easy to use pdf editing stuff                          |
| connection  | **cloudflare**             |                                                            | outside ip connection                                           |
| media       | **kavita**                 |                                                            | ebooks, comics, manga                                           |
| media       | **jellyfin**               |                                                            | videos                                                          |
| media       | **plex (local-only)**      |                                                            | videos (ps5 support)                                            |
| media       | **audiobookshelf**         | https://audiobookshelf.org/docs/documentation/introduction | audio books, podcasts                                           |
| media       | **Navidrome**              | https://www.navidrome.org/docs/overview/                   | For music management                                            |
| media       | **Stash**                  |                                                            | Adult media library                                             |
| monitoring  | **Scrutiny**               |                                                            | Hard drive S.M.A.R.T. health monitoring (alerts on degradation) |
| monitoring  | **Netdata**                |                                                            | Real-time system metrics (CPU, RAM, disk, temperature)          |
| monitoring  | **Glances**                |                                                            | Lightweight network monitoring                                  |
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
- `connection/proxy.yml` (Caddy) sits on `edge` between `cloudflared` and
  every app. `cloudflared`'s tunnel config routes one wildcard hostname to
  Caddy; all per-app hostname routing lives in `connection/Caddyfile`
  instead. Adding a new public app = add a block to the Caddyfile, nothing
  to touch in the tunnel config or Cloudflare dashboard.


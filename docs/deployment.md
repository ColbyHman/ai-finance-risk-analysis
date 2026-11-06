# Deployment

A single-container Docker Compose stack. The app has no backend and no
secrets — it's a static-data POC (see
[`docs/adr/0001-poc-scope-no-plumbing.md`](adr/0001-poc-scope-no-plumbing.md)) —
so this is about as simple as a deployment gets.

## Run it

```bash
cp .env.example .env     # nothing sensitive to fill in today, but see the
                          # comment in .env.example for why this file exists
docker compose build
docker compose up -d
docker compose ps         # should show "healthy" within ~10s
curl -fsS http://localhost:3210/
```

The app listens inside its container on 3000; the compose file publishes
that on host port **3210**. Change the left-hand side of the `ports:` line
in `docker-compose.yml` if 3210 is already taken on the host.

## Putting it on a domain

This stack does **not** run its own reverse proxy or terminate TLS — it
just publishes a plain HTTP port. If the host already runs its own
Caddy/nginx/Traefik for other sites (this is the normal case — don't run a
second public proxy on the same box), add a site block to that *existing*
instance pointing at this container's published port.

Caddy example — add this block to the host's existing Caddyfile:

```caddyfile
finance-poc.yourdomain.com {
	reverse_proxy host.docker.internal:3210
}
```

A few things worth getting right:

- **No `tls` directive.** Caddy's default behavior (a real Let's Encrypt
  certificate via automatic HTTPS) is what you want here. If this domain
  sits behind Cloudflare in Full (strict) mode, a private-CA or
  self-signed origin certificate makes Cloudflare return a 525 to every
  visitor even though the origin itself is healthy — that's the first
  thing to check if this subdomain 525s while others on the same domain
  work fine.
- **`host.docker.internal`** only resolves from inside a container if that
  container's own compose file has
  `extra_hosts: ["host.docker.internal:host-gateway"]` (Linux; Docker
  Desktop resolves it automatically). If the host's existing Caddy stack
  doesn't have that yet, add it there — not here, since this repo doesn't
  own that compose file.
- Point DNS for `finance-poc.yourdomain.com` (or whatever subdomain is
  chosen) at the host before Caddy can issue a certificate for it.

## Updating it

```bash
git pull
docker compose up -d --build
```

# Deploy Fhenix App (Podman Quadlet + Cloudflare Tunnel)

Deploys to `ssh ubuntu@100.117.130.2` in the `termux-stack` pod on port **8787**, public URL **https://fhenix-app.uratmangun.ovh/**.

## Build image locally (do not build on the server)

```bash
cd /path/to/fhenix-app
podman build -t localhost/fhenix-app:latest .
podman save localhost/fhenix-app:latest | gzip -1 | ssh ubuntu@100.117.130.2 'gzip -d | podman load'
```

## Server setup (first time)

```bash
ssh ubuntu@100.117.130.2
mkdir -p ~/.config/fhenix-app ~/.local/share/fhenix-app ~/.config/containers/systemd
cp deploy/podman/fhenix-app.env.example ~/.config/fhenix-app/fhenix-app.env
chmod 600 ~/.config/fhenix-app/fhenix-app.env
sudo chown -R 100:101 ~/.local/share/fhenix-app
cp deploy/podman/fhenix-app.container ~/.config/containers/systemd/
```

Add ingress (before the `http_status:404` rule) in `/home/ubuntu/termux-migration/apps/.cloudflared/config.remote.yml`:

```yaml
  - hostname: fhenix-app.uratmangun.ovh
    service: http://termux-stack:8787
```

Then:

```bash
systemctl --user daemon-reload
systemctl --user start fhenix-app.service
systemctl --user restart cloudflared.service
curl -I https://fhenix-app.uratmangun.ovh
```

## Update deploy

```bash
podman build -t localhost/fhenix-app:latest .
podman save localhost/fhenix-app:latest | gzip -1 | ssh ubuntu@100.117.130.2 'gzip -d | podman load'
ssh ubuntu@100.117.130.2 'systemctl --user restart fhenix-app.service'
```

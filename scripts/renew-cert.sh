
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

docker run --rm \
  -v "$PWD/certbot/www:/var/www/certbot" \
  -v "$PWD/certbot/conf:/etc/letsencrypt" \
  certbot/certbot renew --quiet

docker exec wp-app-public-nginx-1 nginx -s reload

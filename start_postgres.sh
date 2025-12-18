#!/usr/bin/env bash

POSTGRES_USER=gex_user
POSTGRES_PASSWORD=gex_user
POSTGRES_DB=gex_auth

docker run \
  --name gex_postgres \
  --detach \
  --restart unless-stopped \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -p 5432:5432 \
  -v "./gex_postgresql_data:/var/lib/postgresql" \
  postgres:18

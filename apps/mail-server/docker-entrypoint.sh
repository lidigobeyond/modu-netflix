#!/bin/sh
set -e

if [ -n "$SMTP_HOSTNAME" ]; then
  echo "$SMTP_HOSTNAME" > /app/config/me
fi

if [ -n "$SMTP_HOST_LIST" ]; then
  echo "$SMTP_HOST_LIST" | tr ',' '\n' > /app/config/host_list
fi

exec haraka -c /app
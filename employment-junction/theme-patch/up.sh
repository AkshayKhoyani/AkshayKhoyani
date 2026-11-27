#!/bin/bash
# usage: up.sh <local> <remote path under public_html>
B="https://srv2205-files.hstgr.io/rest/a7623d5a7418415b/api/tus/public_html"
A="X-Auth: $AK"; R="X-Auth-Rest: $RK"
S=$(stat -c%s "$1")
curl -s -o /dev/null -w "%{http_code} " -X POST "$B/$2?override=true" -H "$A" -H "$R" -H "Tus-Resumable: 1.0.0" -H "Upload-Length: $S" -H "Upload-Offset: 0"
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH "$B/$2?override=true" -H "$A" -H "$R" -H "Tus-Resumable: 1.0.0" -H "Content-Type: application/offset+octet-stream" -H "Upload-Offset: 0" --data-binary "@$1"

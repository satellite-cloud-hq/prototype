#!/bin/bash

parallel --lb ::: \
  "cd aobc-sils/c2a-aobc/; npm run run-sils:kble" \
  "tmtc_c2a --simulation-id $1 --simulation-start-ms $2 --satconfig aobc-sils/c2a-aobc/satconfig.json --tlmcmddb aobc-sils/c2a-aobc/tlmcmddb.json"

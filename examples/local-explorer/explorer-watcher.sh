#!/bin/bash

function start_explorer() {
    export INIT_PWD=$(pwd)
    
    EXPLORER_MODE=${EXPLORER_MODE:-production}

    if [ "$EXPLORER_MODE" = "production" ]; then
        echo "Running explorer in production mode"
        pnpm explorer
    else
        echo "Running explorer in development mode"
        cd ../../packages/explorer
        pnpm dev
    fi
}

start_explorer

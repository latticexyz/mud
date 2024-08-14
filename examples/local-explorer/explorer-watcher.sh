#!/bin/bash

function start_explorer() {
    export INIT_PWD=$(pwd)
    
    MODE=${MODE:-production}

    if [ "$MODE" = "production" ]; then
        echo "Running explorer in production mode"
        pnpm explorer
    else
        echo "Running explorer in development mode"
        cd ../../packages/explorer
        pnpm dev
    fi
}

start_explorer

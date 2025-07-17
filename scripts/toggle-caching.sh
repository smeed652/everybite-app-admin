#!/bin/bash

# Script to toggle Apollo caching in development
# Usage: ./scripts/toggle-caching.sh [on|off]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.local"

# Default to showing current status if no argument provided
if [ $# -eq 0 ]; then
    if [ -f "$ENV_FILE" ] && grep -q "VITE_ENABLE_CACHING=true" "$ENV_FILE"; then
        echo "✅ Caching is currently ENABLED"
        echo "Run './scripts/toggle-caching.sh off' to disable"
    else
        echo "❌ Caching is currently DISABLED"
        echo "Run './scripts/toggle-caching.sh on' to enable"
    fi
    exit 0
fi

ACTION="$1"

case "$ACTION" in
    "on"|"enable"|"true")
        echo "🔄 Enabling caching..."
        
        # Create .env.local if it doesn't exist
        if [ ! -f "$ENV_FILE" ]; then
            touch "$ENV_FILE"
            echo "Created $ENV_FILE"
        fi
        
        # Add or update the caching flag
        if grep -q "VITE_ENABLE_CACHING" "$ENV_FILE"; then
            # Update existing line
            sed -i.bak 's/VITE_ENABLE_CACHING=.*/VITE_ENABLE_CACHING=true/' "$ENV_FILE"
            rm -f "$ENV_FILE.bak"
        else
            # Add new line
            echo "VITE_ENABLE_CACHING=true" >> "$ENV_FILE"
        fi
        
        echo "✅ Caching enabled! Restart your dev server to apply changes."
        echo "📝 Added VITE_ENABLE_CACHING=true to $ENV_FILE"
        ;;
        
    "off"|"disable"|"false")
        echo "🔄 Disabling caching..."
        
        if [ -f "$ENV_FILE" ]; then
            if grep -q "VITE_ENABLE_CACHING" "$ENV_FILE"; then
                # Remove the line
                sed -i.bak '/VITE_ENABLE_CACHING/d' "$ENV_FILE"
                rm -f "$ENV_FILE.bak"
                echo "✅ Caching disabled! Restart your dev server to apply changes."
                echo "📝 Removed VITE_ENABLE_CACHING from $ENV_FILE"
            else
                echo "ℹ️  Caching was already disabled"
            fi
        else
            echo "ℹ️  No .env.local file found, caching is already disabled"
        fi
        ;;
        
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Usage: $0 [on|off]"
        echo "  on, enable, true  - Enable caching"
        echo "  off, disable, false - Disable caching"
        echo "  (no args) - Show current status"
        exit 1
        ;;
esac

echo ""
echo "💡 Remember to restart your development server after changing this setting!"
echo "   npm run dev" 
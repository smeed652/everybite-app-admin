#!/bin/bash

# Script to configure Apollo cache settings
# Usage: ./scripts/configure-cache.sh [option] [value]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.local"

# Create .env.local if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
    echo "Created $ENV_FILE"
fi

# Function to show current configuration
show_config() {
    echo "🔧 Current Cache Configuration:"
    echo ""
    
    if [ -f "$ENV_FILE" ]; then
        echo "📁 Environment Variables (.env.local):"
        if grep -q "VITE_ENABLE_CACHING" "$ENV_FILE"; then
            echo "  ✅ VITE_ENABLE_CACHING=$(grep "VITE_ENABLE_CACHING" "$ENV_FILE" | cut -d'=' -f2)"
        else
            echo "  ❌ VITE_ENABLE_CACHING not set (defaults to false in development)"
        fi
        
        if grep -q "VITE_SCHEDULED_REFRESH_TIME" "$ENV_FILE"; then
            echo "  ✅ VITE_SCHEDULED_REFRESH_TIME=$(grep "VITE_SCHEDULED_REFRESH_TIME" "$ENV_FILE" | cut -d'=' -f2)"
        else
            echo "  ⚙️  VITE_SCHEDULED_REFRESH_TIME not set (defaults to 06:00)"
        fi
        
        if grep -q "VITE_SCHEDULED_REFRESH_TIMEZONE" "$ENV_FILE"; then
            echo "  ✅ VITE_SCHEDULED_REFRESH_TIMEZONE=$(grep "VITE_SCHEDULED_REFRESH_TIMEZONE" "$ENV_FILE" | cut -d'=' -f2)"
        else
            echo "  ⚙️  VITE_SCHEDULED_REFRESH_TIMEZONE not set (defaults to America/Los_Angeles)"
        fi
        
        if grep -q "VITE_SCHEDULED_REFRESH_ENABLED" "$ENV_FILE"; then
            echo "  ✅ VITE_SCHEDULED_REFRESH_ENABLED=$(grep "VITE_SCHEDULED_REFRESH_ENABLED" "$ENV_FILE" | cut -d'=' -f2)"
        else
            echo "  ⚙️  VITE_SCHEDULED_REFRESH_ENABLED not set (defaults to true)"
        fi
        
        if grep -q "VITE_CACHE_TTL" "$ENV_FILE"; then
            echo "  ✅ VITE_CACHE_TTL=$(grep "VITE_CACHE_TTL" "$ENV_FILE" | cut -d'=' -f2)"
        else
            echo "  ⚙️  VITE_CACHE_TTL not set (defaults to 86400000 - 24 hours)"
        fi
    else
        echo "📁 No .env.local file found"
    fi
    
    echo ""
    echo "💡 Default Configuration:"
    echo "  • Caching: Disabled in development, enabled in staging/production"
    echo "  • Scheduled Refresh: 6:00 AM Pacific Time daily"
    echo "  • Cache TTL: 24 hours"
    echo ""
    echo "🔄 Usage:"
    echo "  $0 time HH:MM          - Set scheduled refresh time (e.g., 06:00)"
    echo "  $0 timezone TIMEZONE   - Set timezone (e.g., America/New_York)"
    echo "  $0 ttl MILLISECONDS    - Set cache TTL (e.g., 86400000 for 24h)"
    echo "  $0 enable              - Enable scheduled refresh"
    echo "  $0 disable             - Disable scheduled refresh"
    echo "  $0 show                - Show current configuration"
}

# Function to update environment variable
update_env_var() {
    local var_name="$1"
    local var_value="$2"
    
    if grep -q "^${var_name}=" "$ENV_FILE"; then
        # Update existing line
        sed -i.bak "s/^${var_name}=.*/${var_name}=${var_value}/" "$ENV_FILE"
        rm -f "$ENV_FILE.bak"
        echo "✅ Updated ${var_name}=${var_value}"
    else
        # Add new line
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
        echo "✅ Added ${var_name}=${var_value}"
    fi
}

# Function to remove environment variable
remove_env_var() {
    local var_name="$1"
    
    if grep -q "^${var_name}=" "$ENV_FILE"; then
        sed -i.bak "/^${var_name}=/d" "$ENV_FILE"
        rm -f "$ENV_FILE.bak"
        echo "✅ Removed ${var_name}"
    else
        echo "ℹ️  ${var_name} not found in .env.local"
    fi
}

# Main script logic
if [ $# -eq 0 ]; then
    show_config
    exit 0
fi

OPTION="$1"
VALUE="$2"

case "$OPTION" in
    "time")
        if [ -z "$VALUE" ]; then
            echo "❌ Error: Time value required"
            echo "Usage: $0 time HH:MM (e.g., 06:00)"
            exit 1
        fi
        
        # Validate time format
        if [[ ! "$VALUE" =~ ^([01]?[0-9]|2[0-3]):[0-5][0-9]$ ]]; then
            echo "❌ Error: Invalid time format. Use HH:MM (e.g., 06:00)"
            exit 1
        fi
        
        update_env_var "VITE_SCHEDULED_REFRESH_TIME" "$VALUE"
        echo "🕐 Scheduled refresh time set to ${VALUE}"
        ;;
        
    "timezone")
        if [ -z "$VALUE" ]; then
            echo "❌ Error: Timezone value required"
            echo "Usage: $0 timezone TIMEZONE (e.g., America/New_York)"
            exit 1
        fi
        
        update_env_var "VITE_SCHEDULED_REFRESH_TIMEZONE" "$VALUE"
        echo "🌍 Scheduled refresh timezone set to ${VALUE}"
        ;;
        
    "ttl")
        if [ -z "$VALUE" ]; then
            echo "❌ Error: TTL value required"
            echo "Usage: $0 ttl MILLISECONDS (e.g., 86400000 for 24 hours)"
            exit 1
        fi
        
        # Validate TTL is a positive number
        if ! [[ "$VALUE" =~ ^[0-9]+$ ]] || [ "$VALUE" -le 0 ]; then
            echo "❌ Error: TTL must be a positive number"
            exit 1
        fi
        
        update_env_var "VITE_CACHE_TTL" "$VALUE"
        echo "⏱️  Cache TTL set to ${VALUE} milliseconds"
        ;;
        
    "enable")
        update_env_var "VITE_SCHEDULED_REFRESH_ENABLED" "true"
        echo "✅ Scheduled refresh enabled"
        ;;
        
    "disable")
        update_env_var "VITE_SCHEDULED_REFRESH_ENABLED" "false"
        echo "❌ Scheduled refresh disabled"
        ;;
        
    "show")
        show_config
        ;;
        
    *)
        echo "❌ Unknown option: $OPTION"
        echo ""
        show_config
        exit 1
        ;;
esac

echo ""
echo "💡 Remember to restart your development server to apply changes!"
echo "   npm run dev" 
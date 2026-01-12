#!/bin/bash

# Script to run database migrations on Supabase
# Usage: ./run-migration.sh [migration_file]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}K3HOOT Database Migration Runner${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if migration file is provided
MIGRATION_FILE=${1:-"src/supabase/migrations/004_optimization_for_arcium.sql"}

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Migration file: $MIGRATION_FILE${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Create .env with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}Error: NEXT_PUBLIC_SUPABASE_URL not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}Supabase URL: $NEXT_PUBLIC_SUPABASE_URL${NC}"
echo ""

# Option 1: Run via psql (if you have direct database access)
echo -e "${YELLOW}Choose migration method:${NC}"
echo "1) Run via Supabase Dashboard (SQL Editor)"
echo "2) Run via psql (requires DB connection string)"
echo "3) Copy SQL to clipboard"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo -e "${GREEN}Opening Supabase Dashboard...${NC}"
        echo ""
        echo "1. Go to: ${NEXT_PUBLIC_SUPABASE_URL/https:\/\//}/project/default/sql"
        echo "2. Paste the contents of: $MIGRATION_FILE"
        echo "3. Click 'Run'"
        echo ""
        echo -e "${YELLOW}Contents of $MIGRATION_FILE:${NC}"
        echo "----------------------------------------"
        cat "$MIGRATION_FILE"
        echo "----------------------------------------"
        ;;
    2)
        read -p "Enter your Supabase database connection string: " DB_URL
        echo -e "${GREEN}Running migration via psql...${NC}"
        psql "$DB_URL" -f "$MIGRATION_FILE"
        echo -e "${GREEN}Migration completed!${NC}"
        ;;
    3)
        if command -v pbcopy &> /dev/null; then
            cat "$MIGRATION_FILE" | pbcopy
            echo -e "${GREEN}SQL copied to clipboard!${NC}"
        elif command -v xclip &> /dev/null; then
            cat "$MIGRATION_FILE" | xclip -selection clipboard
            echo -e "${GREEN}SQL copied to clipboard!${NC}"
        else
            echo -e "${YELLOW}Clipboard command not found. Here's the SQL:${NC}"
            cat "$MIGRATION_FILE"
        fi
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Next Steps:${NC}"
echo -e "${GREEN}1. Verify migration ran successfully${NC}"
echo -e "${GREEN}2. Check indexes: SELECT * FROM pg_indexes WHERE tablename='game_sessions'${NC}"
echo -e "${GREEN}3. Test helper functions: SELECT get_leaderboard('session-uuid')${NC}"
echo -e "${GREEN}========================================${NC}"

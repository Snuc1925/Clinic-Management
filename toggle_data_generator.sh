#!/bin/bash

# Script to disable/enable the DataGenerator component
# This modifies the DataGenerator.java file to toggle the @Component annotation

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_GENERATOR_FILE="$SCRIPT_DIR/backend/src/main/java/com/hust/clinic/DataGenerator.java"

if [ ! -f "$DATA_GENERATOR_FILE" ]; then
    echo "Error: DataGenerator.java not found at $DATA_GENERATOR_FILE"
    exit 1
fi

# Check current status
if grep -q "^@Component" "$DATA_GENERATOR_FILE"; then
    echo "DataGenerator is currently ENABLED"
    echo "Disabling DataGenerator..."
    # Use backup file for macOS/BSD compatibility
    sed -i.bak 's/^@Component$/\/\/@Component/' "$DATA_GENERATOR_FILE"
    rm -f "${DATA_GENERATOR_FILE}.bak"
    echo "✓ DataGenerator has been DISABLED"
    echo "  The data generation script will not run automatically on application startup."
else
    echo "DataGenerator is currently DISABLED"
    echo "Enabling DataGenerator..."
    # Use backup file for macOS/BSD compatibility
    sed -i.bak 's/^\/\/@Component$/@Component/' "$DATA_GENERATOR_FILE"
    rm -f "${DATA_GENERATOR_FILE}.bak"
    echo "✓ DataGenerator has been ENABLED"
    echo "  The data generation script will run automatically on next application startup."
fi

echo ""
echo "Current status:"
grep -E "(^@Component|^//@Component)" "$DATA_GENERATOR_FILE"

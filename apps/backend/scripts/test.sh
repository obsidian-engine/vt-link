#!/bin/bash

# Test execution script for VT-Link Backend
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="unit"
COVERAGE=false
VERBOSE=false
GENERATE_MOCKS=false
CLEAN=false

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Test execution script for VT-Link Backend

OPTIONS:
    -t, --type TYPE         Test type: unit, integration, e2e, all (default: unit)
    -c, --coverage          Generate coverage report
    -v, --verbose           Verbose output
    -g, --generate          Generate mocks before running tests
    -C, --clean             Clean before running tests
    -h, --help              Show this help message

EXAMPLES:
    $0                      Run unit tests
    $0 -t integration       Run integration tests
    $0 -t all -c            Run all tests with coverage
    $0 -t unit -g -v        Run unit tests with mock generation and verbose output

ENVIRONMENT VARIABLES:
    TEST_DATABASE_URL       Database URL for integration tests
    E2E_BASE_URL           Base URL for E2E tests (default: http://localhost:3000)
    E2E_SKIP               Skip E2E tests if set to 'true'
    CI                     Set to 'true' in CI environment

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -g|--generate)
            GENERATE_MOCKS=true
            shift
            ;;
        -C|--clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate test type
case $TEST_TYPE in
    unit|integration|e2e|all)
        ;;
    *)
        print_error "Invalid test type: $TEST_TYPE"
        print_info "Valid types: unit, integration, e2e, all"
        exit 1
        ;;
esac

# Change to project directory
cd "$PROJECT_DIR"

print_info "Starting test execution..."
print_info "Test type: $TEST_TYPE"
print_info "Coverage: $COVERAGE"
print_info "Verbose: $VERBOSE"
print_info "Generate mocks: $GENERATE_MOCKS"
print_info "Clean: $CLEAN"

# Clean if requested
if [ "$CLEAN" = true ]; then
    print_info "Cleaning..."
    make clean
fi

# Install dependencies
print_info "Installing dependencies..."
make deps

# Generate mocks if requested
if [ "$GENERATE_MOCKS" = true ]; then
    print_info "Generating mocks..."
    make generate
fi

# Set test flags
TEST_FLAGS=""
if [ "$VERBOSE" = true ]; then
    TEST_FLAGS="$TEST_FLAGS -v"
fi

# Function to run unit tests
run_unit_tests() {
    print_info "Running unit tests..."
    if [ "$COVERAGE" = true ]; then
        make test-coverage-ci
    else
        make test-unit
    fi
    print_success "Unit tests completed"
}

# Function to run integration tests
run_integration_tests() {
    print_info "Running integration tests..."

    # Check if TEST_DATABASE_URL is set
    if [ -z "$TEST_DATABASE_URL" ]; then
        if [ "$CI" = "true" ]; then
            print_error "TEST_DATABASE_URL is required for integration tests in CI"
            exit 1
        else
            print_warning "TEST_DATABASE_URL not set, skipping integration tests"
            return 0
        fi
    fi

    print_info "Using test database: $TEST_DATABASE_URL"
    make test-integration
    print_success "Integration tests completed"
}

# Function to run E2E tests
run_e2e_tests() {
    print_info "Running E2E tests..."

    # Check if E2E tests should be skipped
    if [ "$E2E_SKIP" = "true" ]; then
        print_warning "E2E tests are disabled (E2E_SKIP=true)"
        return 0
    fi

    # Set default E2E base URL if not provided
    if [ -z "$E2E_BASE_URL" ]; then
        export E2E_BASE_URL="http://localhost:3000"
        print_info "Using default E2E base URL: $E2E_BASE_URL"
    else
        print_info "Using E2E base URL: $E2E_BASE_URL"
    fi

    make test-e2e
    print_success "E2E tests completed"
}

# Function to setup test database for integration tests
setup_test_database() {
    if [ -n "$TEST_DATABASE_URL" ] && command -v goose &> /dev/null; then
        print_info "Setting up test database..."
        goose -dir ./internal/migrations postgres "$TEST_DATABASE_URL" up
        print_success "Test database setup completed"
    elif [ -n "$TEST_DATABASE_URL" ]; then
        print_warning "goose not found, skipping database setup"
        print_info "Install goose with: go install github.com/pressly/goose/v3/cmd/goose@latest"
    fi
}

# Main test execution logic
case $TEST_TYPE in
    unit)
        run_unit_tests
        ;;
    integration)
        setup_test_database
        run_integration_tests
        ;;
    e2e)
        run_e2e_tests
        ;;
    all)
        run_unit_tests
        setup_test_database
        run_integration_tests
        run_e2e_tests
        ;;
esac

print_success "All requested tests completed successfully!"

# Show coverage report if generated
if [ "$COVERAGE" = true ] && [ -f "coverage.out" ]; then
    print_info "Coverage report generated: coverage.out"
    if command -v go &> /dev/null; then
        print_info "Coverage summary:"
        go tool cover -func=coverage.out | tail -1
    fi
fi

exit 0
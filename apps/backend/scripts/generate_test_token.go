package main

import (
	"fmt"
	"os"
	"vt-link/backend/internal/infrastructure/auth"
)

func main() {
	// Get JWT secret from environment
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		fmt.Println("Error: JWT_SECRET environment variable is required")
		os.Exit(1)
	}

	// Get user ID from command line argument
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run generate_test_token.go <user-id>")
		os.Exit(1)
	}
	userID := os.Args[1]

	// Create JWT manager
	jwtManager := auth.NewJWTManager(secret)

	// Generate access token
	token, err := jwtManager.GenerateToken(userID)
	if err != nil {
		fmt.Printf("Error generating token: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(token)
}

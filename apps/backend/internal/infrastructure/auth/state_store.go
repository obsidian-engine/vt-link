package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"sync"
	"time"
)

// StateStore defines the interface for managing OAuth state tokens
type StateStore interface {
	// Generate creates a new state token and stores it with TTL
	Generate() (string, error)
	// Validate checks if the state token exists and is valid, then removes it (one-time use)
	Validate(state string) error
}

// InMemoryStateStore is an in-memory implementation of StateStore
// Note: This is suitable for single-instance deployments.
// For multi-instance deployments, use Redis or other distributed storage.
type InMemoryStateStore struct {
	mu     sync.RWMutex
	states map[string]time.Time
	ttl    time.Duration
}

// NewInMemoryStateStore creates a new InMemoryStateStore with the specified TTL
func NewInMemoryStateStore(ttl time.Duration) StateStore {
	store := &InMemoryStateStore{
		states: make(map[string]time.Time),
		ttl:    ttl,
	}

	// Start background cleanup goroutine
	go store.cleanup()

	return store
}

// Generate creates a new cryptographically secure state token
func (s *InMemoryStateStore) Generate() (string, error) {
	// Generate 32 random bytes for strong entropy
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate random state: %w", err)
	}

	// Encode as URL-safe base64
	state := base64.URLEncoding.EncodeToString(b)

	s.mu.Lock()
	defer s.mu.Unlock()

	// Store state with expiration time
	s.states[state] = time.Now().Add(s.ttl)

	return state, nil
}

// Validate checks if the state exists and is not expired
// The state is removed after validation (one-time use) to prevent replay attacks
func (s *InMemoryStateStore) Validate(state string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	expiresAt, exists := s.states[state]
	if !exists {
		return fmt.Errorf("invalid state: state not found or already used")
	}

	// Check if state has expired
	if time.Now().After(expiresAt) {
		delete(s.states, state)
		return fmt.Errorf("invalid state: state has expired")
	}

	// Remove state immediately after successful validation (one-time use)
	delete(s.states, state)

	return nil
}

// cleanup periodically removes expired states
func (s *InMemoryStateStore) cleanup() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		now := time.Now()
		for state, expiresAt := range s.states {
			if now.After(expiresAt) {
				delete(s.states, state)
			}
		}
		s.mu.Unlock()
	}
}

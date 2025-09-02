# --- Builder stage ---
FROM golang:1.23-bookworm AS builder

WORKDIR /app

# Copy go.mod and go.sum for dependency caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /go-server ./cmd/server

# --- Runtime stage ---
FROM gcr.io/distroless/static-debian12:nonroot

# Set timezone
ENV TZ=Asia/Tokyo

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /go-server .

# Expose port
EXPOSE 8080

# Run the binary
ENTRYPOINT ["./go-server"]
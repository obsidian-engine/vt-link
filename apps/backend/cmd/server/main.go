package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	log.Println("VT-Link Backend Server starting...")

	// 基本的なヘルスチェックエンドポイント
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "OK")
	})

	port := "8080"
	log.Printf("Server listening on port %s", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
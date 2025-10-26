package main

import (
	"archive/zip"
	"bytes"
	"context"
	_ "embed"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"time"
)

//go:embed app.zip
var embeddedApp []byte

func main() {
	log.SetFlags(0)
	log.SetOutput(os.Stdout)

	fmt.Println("Starting Image Compare desktop helper...")

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("failed to start local server: %v", err)
	}

	addr := listener.Addr().String()
	url := fmt.Sprintf("http://localhost:%s/index.html", portFromAddr(addr))

	appDir, cleanup, err := prepareAppDirectory()
	if err != nil {
		log.Fatalf("unable to unpack embedded app: %v", err)
	}
	defer cleanup()

	mux := http.NewServeMux()
	fileServer := http.FileServer(http.Dir(appDir))
	mux.Handle("/", withSecurityHeaders(fileServer))

	server := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	serverErrors := make(chan error, 1)
	go func() {
		if err := server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	if err := openBrowser(url); err != nil {
		log.Printf("Open %s in your browser to use Image Compare.", url)
		log.Printf("Failed to launch browser automatically: %v", err)
	}

	log.Printf("Image Compare is running at %s", url)
	log.Println("Keep this window open while using the application.")
	log.Println("Press Ctrl+C to quit when you're done.")

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	select {
	case <-sigCh:
		log.Println("Shutting down...")
	case err := <-serverErrors:
		log.Fatalf("server error: %v", err)
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("failed to shut down server: %v", err)
	}

	log.Println("Goodbye!")
}

func withSecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
		w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
		w.Header().Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}

func portFromAddr(addr string) string {
	parts := strings.Split(addr, ":")
	if len(parts) == 0 {
		return ""
	}
	return parts[len(parts)-1]
}

func openBrowser(url string) error {
	switch runtime.GOOS {
	case "windows":
		return exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		return exec.Command("open", url).Start()
	default:
		return exec.Command("xdg-open", url).Start()
	}
}

func prepareAppDirectory() (string, func(), error) {
	reader, err := zip.NewReader(bytes.NewReader(embeddedApp), int64(len(embeddedApp)))
	if err != nil {
		return "", func() {}, err
	}

	tempDir, err := os.MkdirTemp("", "image-compare-app-")
	if err != nil {
		return "", func() {}, err
	}

	cleanup := func() {
		os.RemoveAll(tempDir)
	}

	for _, file := range reader.File {
		if !strings.HasPrefix(file.Name, "app/") {
			continue
		}

		relPath := strings.TrimPrefix(file.Name, "app/")
		if relPath == "" {
			continue
		}

		targetPath := filepath.Join(tempDir, relPath)

		if file.FileInfo().IsDir() {
			if err := os.MkdirAll(targetPath, 0o755); err != nil {
				cleanup()
				return "", func() {}, err
			}
			continue
		}

		if err := os.MkdirAll(filepath.Dir(targetPath), 0o755); err != nil {
			cleanup()
			return "", func() {}, err
		}

		src, err := file.Open()
		if err != nil {
			cleanup()
			return "", func() {}, err
		}

		dst, err := os.OpenFile(targetPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, file.Mode())
		if err != nil {
			src.Close()
			cleanup()
			return "", func() {}, err
		}

		if _, err := io.Copy(dst, src); err != nil {
			dst.Close()
			src.Close()
			cleanup()
			return "", func() {}, err
		}

		dst.Close()
		src.Close()
	}

	return tempDir, cleanup, nil
}

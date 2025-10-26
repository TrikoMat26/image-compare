# Image Compare for Windows

This folder contains a pre-built `ImageCompare.exe` binary that runs the
Image Compare web application directly on Windows without requiring additional
software.

## How it works

The executable bundles a tiny local web server that serves the offline Image
Compare application assets. When you launch the program it automatically opens
the default browser to `http://localhost:<port>/index.html` and prints the URL
inside a small console window. Keep the console open while you are using the
app and close it when you want to stop the server.

## Usage

1. Download the entire `windows` folder to a Windows computer.
2. Double-click `ImageCompare.exe`.
3. Your default browser opens the Image Compare interface. Use the console
   window to see the local URL and press `Ctrl+C` in that window to quit.

No installation is required. The executable runs completely offline and ships
with all the files it needs.

## Rebuilding the binary

If you want to rebuild the Windows launcher yourself, install
[Go](https://go.dev/) 1.21 or newer and run the following from the repository
root:

```bash
./scripts/sync-go-desktop.sh
GOOS=windows GOARCH=amd64 go build -ldflags "-s -w" -o windows/ImageCompare.exe ./cmd/image-compare-desktop
```

The `sync-go-desktop.sh` script packages the latest version of the web
application into the Go launcher before compiling.

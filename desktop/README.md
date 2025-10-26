# Image Compare Desktop Wrapper

This folder contains the files required to package the Image Compare web
application into a native Windows executable using [Electron](https://electronjs.org/).

## Prerequisites

1. Install [Node.js](https://nodejs.org/) 18 or newer on Windows.
2. Install the app dependencies:

   ```powershell
   cd desktop
   npm install
   ```

## Run the desktop app locally

During development you can run the app directly on Windows without creating the
final executable:

```powershell
npm start
```

## Build the portable Windows executable

The following command generates a self-contained `Image Compare` executable
(`.exe`) in the `desktop/dist` directory. The binary bundles the entire web app
and can be run without installing additional dependencies.

```powershell
npm run build:win
```

The output `Image Compare-<version>-portable.exe` file can be copied to any
Windows computer and launched directly.

## Notes

- The packaged application keeps the same offline behaviour as the web version.
- To build 32-bit or installer variants, pass the desired targets directly to
  `electron-builder` (for example `electron-builder --win nsis --x64 --ia32`).
- A Go-based launcher that opens the web application in the default browser is
  available in [`cmd/image-compare-desktop`](../cmd/image-compare-desktop). Use
  `./scripts/sync-go-desktop.sh` followed by `GOOS=windows GOARCH=amd64 go build`
  to rebuild the ready-to-use executable stored in [`windows/`](../windows/).

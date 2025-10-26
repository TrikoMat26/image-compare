# Image Compare
Image Compare is a lightweight, standalone and offline application to visually compare two images and highlight their differences. This application can be used in desktop computers and mobile phones without requiring installation as it runs entirely in a web browser. Image Compare is an open source software developed and maintained by the [VGG Oxford](https://www.robots.ox.ac.uk/~vgg/).

More details about Image Compare software application is available in the following websites:
 - https://www.robots.ox.ac.uk/~vgg/software/image-compare/
 - https://vgg.gitlab.io/image-compare/ (mirror)

The latest version of Image Compare software application is available at: https://www.robots.ox.ac.uk/~vgg/software/image-compare/app/latest/

## Features
 - Offline : Can be used without an active internet connection.
 - Open Source : Complete freedom to use this application or modify its source code.
 - Standalone : No installation is required as the application runs entirely in a web browser.
 - Visualisations : Several ways to visualise the similarity and difference between images.
 - Light Weight : The full application is less than 2Mb in size and therefore is faster to load and easier to share.
 - Advanced Mode : Choose geometric transformation (e.g. similarity, affine, thin-plate spline, etc.)

## Use Cases
See https://www.robots.ox.ac.uk/~vgg/software/image-compare/#usecases which shows the application of Image Compare software for the following:
 - Art Restoration : Identify the changes caused by art restoration process
 - Digital Collation : Compare different editions of the same book and identify variants
 - Photograph : Identify alteration in digital photographs
 - Satellite : Identify changes in satellite imagery
 - Music : Identify variants in music sheet

## Windows desktop options

Two alternatives are available to run Image Compare as a native-feeling
application on Windows without relying on an internet connection.

### 1. Ready-to-use executable

A pre-built launcher is available in the [`windows/`](windows/) folder. Download
that folder to a Windows computer and double-click `ImageCompare.exe`. Your
default browser will open the offline Image Compare interface served from the
local machine. Close the console window (or press <kbd>Ctrl</kbd>+<kbd>C</kbd>)
to stop the application. See [`windows/README.md`](windows/README.md) for
additional details.

### 2. Electron packaging (build it yourself)

If you prefer a traditional Electron-based desktop window, use the wrapper in
[`desktop/`](desktop/) to create a portable executable:

1. Install [Node.js](https://nodejs.org/) 18 or later on Windows.
2. Install dependencies and build the executable:

   ```powershell
   cd desktop
   npm install
   npm run build:win
   ```

The packaged binary is created in `desktop/dist` and can be copied to any
Windows computer to run Image Compare without installing dependencies.

## About
Image Compare software application is developed and maintained by Prasanna Sridhar, Abhishek Dutta and Andrew Zisserman.

Development and maintenance of the Image Compare software has been supported by the [VisualAI](https://gtr.ukri.org/projects?ref=EP%2FT028572%2F1) research grant.

Contact [Prasanna Sridhar](removeme-prasanna@robots.ox.ac.uk) for any queries or feedback related to this software application.

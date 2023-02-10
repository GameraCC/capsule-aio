# Capsule
https://user-images.githubusercontent.com/54292532/218015991-05ee6edd-591b-4755-9034-0eb892f2da28.mp4

## Getting Started

1. Run npm install.
   ...`npm i`
2. Run npm nologin.
   ...`npm nologin`

If backend infrastructure is live and hosted:

3. Run npm start
   ...`npm start`

# Building

1. Run npm install.
   ...`npm i`
2. Run npm run build
   ...`npm run build`
3. (Optional) Run npm run run-build
   ...`npm run run-build`

## Advanced

### Running in Dev mode

Run the npm start command.
...`npm start`
The react webbuild server will run and then electron will start. This
will allow live changes to the GUI to be propogated instantly to the
window.

### Running in Debug mode

Run the npm debug command.
...`npm debug`
The react app will be built into static files and then run from those files.

### Running in Release mode

Run the npm release command.
...`npm release`
The react app will be built into a pre-package configuration

### Packaging Application

#### NOT YET IMPLEMENTED

Run the npm publish command.
...`npm package`
A release version of the application will be built in ./bin/build/release, which will then be used to create a publishable build in ./bin/build/ for the default platform or a platform specified.

## Npm

| Command   | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| npm start | Starts react webbuild server and runs electron                    |
| npm debug | Builds react application and runs electron using the static files |

## Electron

Electron is used to provide the GUI for the application.

#### main.js

The entrypoint for the application.

# superkaola
> Superkaola is a universal bundler for kaola front-end Vue project.

## Install
Install superkaola as a global package:
```shell
npm install superkaola -g
```
or install as a local package(recommended):
```shell
npm install superkaola -D
```

## Usage
### init
Initialize a superkaola.json in the working directory, superkaola will run building based on this configuration file.
```shell
npx superkaola init
```

### build
Build the project.
Run building in development mode:
```shell
npx superkaola dev
```
or run building in development mode:
```shell
npx superkaola prd
```

## TODO
* [ ] add support for js format of configuration file
* [ ] new feature: superkaola cdn, upload files to cdn
* [ ] new feature: superkaola upgrade, upgrade superkaola.json when new configuration item is introduced.
* [ ] add support for ssr
* [ ] provide an api for hot-reload out of superkaola



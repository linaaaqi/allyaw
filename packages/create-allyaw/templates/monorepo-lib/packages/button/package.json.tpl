{
  "name": "{{{ name }}}",
  "version": "0.0.1",
  "description": "{{{ description }}}",
  "keywords": [],
  "author": "{{{ author }}}",
  "license": "MIT",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "typings": "dist/types/index.d.ts",
  "files": [
    "dist"
  ],
  "dependencies": {},
  "peerDependencies": {
    "react": "^16.9.0",
    "react-dom": "^16.9.0"
  },
  "scripts": {
    "start": "dumi dev",
    "build": "rimraf dist && allyaw compile",
    "types": "tsc --noEmit",
    "test": "jest"
  }
}

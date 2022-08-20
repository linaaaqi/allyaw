{
  "name": "{{{ templateName }}}",
  "private": true,
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "start": "dumi dev",
    "docs:build": "rimraf dist && dumi build",
    "build": "magic-cli compile",
    "types": "tsc --noEmit",
    "test": "jest"
  },
  "devDependencies": {
    "@changesets/cli": "^2.21.0",
    "@commitlint/cli": "^15.0.0",
    "@commitlint/config-conventional": "^15.0.0",
    "@tf-magic/cli": "^1.5.4",
    "@types/jest": "^27.4.0",
    "@types/react": "^17.0.37",
    "commitlint": "^15.0.0",
    "dumi": "^1.1.38",
    "husky": "^7.0.4",
    "jest": "^27.4.3",
    "react": "^16.9.0",
    "react-dom": "^16.9.0",
    "rimraf": "^3.0.2",
    "ts-jest": "^27.0.7",
    "typescript": "^4.5.2"
  },
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}

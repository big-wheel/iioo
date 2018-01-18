# hawkeyee

[![build status](https://img.shields.io/travis/big-wheel/hawkeyee/master.svg?style=flat-square)](https://travis-ci.org/big-wheel/hawkeyee)
[![Test coverage](https://img.shields.io/codecov/c/github/big-wheel/hawkeyee.svg?style=flat-square)](https://codecov.io/github/big-wheel/hawkeyee?branch=master)
[![NPM version](https://img.shields.io/npm/v/hawkeyee.svg?style=flat-square)](https://www.npmjs.com/package/hawkeyee)
[![NPM Downloads](https://img.shields.io/npm/dm/hawkeyee.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/hawkeyee)

 ✨ A Pluggable watcher node http server

```text
(File System / Memery / ...)
  Watcher ====’
    |         |
    | to      |
  Server === Plugin (eg. live-markdown)
  to|         |
    |(ws)     |
    |to       |
  Client  ===’
```

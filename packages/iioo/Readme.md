# iioo

[![build status](https://img.shields.io/travis/big-wheel/iioo/master.svg?style=flat-square)](https://travis-ci.org/big-wheel/iioo)
[![Test coverage](https://img.shields.io/codecov/c/github/big-wheel/iioo.svg?style=flat-square)](https://codecov.io/github/big-wheel/iioo?branch=master)
[![NPM version](https://img.shields.io/npm/v/iioo.svg?style=flat-square)](https://www.npmjs.com/package/iioo)
[![NPM Downloads](https://img.shields.io/npm/dm/iioo.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/iioo)

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

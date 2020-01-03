```___
         /\  \         _____
        |::\  \       /::\  \
        |:|:\  \     /:/\:\  \
      __|:|\:\  \   /:/ /::\__\
     /::::|_\:\__\ /:/_/:/\:|__|
     \:\~~\  \/__/ \:\/:/ /:/  /
      \:\  \        \::/_/:/  /
       \:\  \        \:\/:/  /
        \:\__\        \::/  /
         \/__/         \/__/
```

### Multi Branch

did you ever want to run more than one branch of your code at a time? and have the ability to switch between them by simply setting an HTTP header key named 'branch'

To easily use multi-branch install [ModHeader extension for chrome](https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj?hl=en). you can set the "branch" header key with this tool.



### Installation

1. install the package

```
npm install multi-branch --save
```

2. add this command to your existing npm start command

```
multi-branch --only=staging --branches=master,stage --default-branch=stage &&
```

example (package.json):

```json
{
  "name": ...,
  "version": ...,
  "repository": ...,
  "author": ...,
  "license": ...,
  "scripts": {
    "start": "multi-branch --only=staging --branches=master,stage --default-branch=stage && node app.js"
  },
  "dependencies": {
    ...
  }
}
```

**arguments:**

```
    -p,--port to specify port MultiBranch will listen to

    --port-env to specify project port env name

    --default-branch to specify default branch for reverse proxy

    --only to specify multi branch run env

    -b,--branch comma separated branch names to run

    -h,--help to view help
```

### Maintenance routes

#### [GET] /multi-branch

this route will be available at top of reverse proxy server and shows you information about branch processes

#### [GET] /multi-branch/stats

get last 100 process usage stat

#### [GET] /multi-branch/logs

![Multi-Branch logs](https://raw.githubusercontent.com/m-esm/node-multi-branch/master/screenshot-logs.png "Multi-Branch logs")

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

It runs an instance per branch of your node project repository. and let you access different branches by setting a header key.

#### [GET] /multi-branch

this route will be available at top of reverse proxy server and shows you information about branch processes

#### [GET] /multi-branch/stats

get last 100 process usage stat

**arguments:**

```
    -p,--port to specify port MultiBranch will listen to

    --port-env to specify project port env name

    --default-branch to specify default branch for reverse proxy

    --only to specify multi branch run env

    -b,--branch comma separated branch names to run

    -h,--help to view help
```

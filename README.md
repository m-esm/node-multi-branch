### Node multi branch deployment
It runs an instance per branch of your node project repository. and let you access different branches by setting a header key.


    
        
    
          ___                   
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
    

    -p,--port to specify port MultiBranch will listen to
    
    --port-env to specify project port env name
    
    --default-branch to specify default branch for reverse proxy
    
    --only to specify multi branch run env
    
    -b,--branch comma separated branch names to run
    
    -h,--help to view help
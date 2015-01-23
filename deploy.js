var s3 = require('s3'),
    config = require('./config'),

    client = s3.createClient({
      maxAsyncS3: 20,
      s3RetryCount: 3,    
      s3RetryDelay: 1000, 
      multipartUploadThreshold: 20971520, 
      multipartUploadSize: 15728640,
      s3Options: {
        accessKeyId: config.key,
        secretAccessKey: config.secret
      },
    }),

    params = {
      localDir: __dirname + '/public',
      deleteRemoved: true,
      s3Params: {
        Bucket: config.bucket
      },
    },

    compile = require('./build');

compile(function(){
  
  console.log('Compilation complete. Starting upload to S3...');

  var uploader = client.uploadDir(params);

  uploader.on('error', function(err) {
    console.error("Syncing error:", err.stack);
  });

  uploader.on('progress', function() {
    // console.log("progress", uploader.progressAmount, uploader.progressTotal);
  });

  uploader.on('end', function() {
    console.log("Upload complete!");
  });
});


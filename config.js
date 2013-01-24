var config;
config  = {
  STATIC_PORT : 8080,
  TCP_PORT : 8888,
  SOCKETIO_PORT : 8889,
  db : {
    dev : {
      USER : "",
      PASS : "",
      HOST : "localhost",
      PORT : "27017",
      DATABASE : "arena"
    },
    pro : {
       USER : "",
       PASS : "",
       HOST : "",
       PORT : "",
       DATABASE : ""
    }
  }
};
module.exports = config;

// server/socket/postEvents.js

module.exports = function (io) {
  console.log("✅ PostEvents system loaded");

  io.on("connection", (socket) => {
    console.log("✅ PostEvents connected:", socket.id);

    //-----------------------------------------
    // ✅ NEW POST CREATED
    //-----------------------------------------
    socket.on("post:new", (post) => {
      io.emit("post:new", post);
    });

    //-----------------------------------------
    // ✅ POST EDITED
    //-----------------------------------------
    socket.on("post:edit", (post) => {
      io.emit("post:edit", post);
    });

    //-----------------------------------------
    // ✅ POST DELETED
    //-----------------------------------------
    socket.on("post:delete", (postId) => {
      io.emit("post:delete", postId);
    });

    //-----------------------------------------
    // ✅ LIKE / UNLIKE
    //-----------------------------------------
    socket.on("post:like", (data) => {
      io.emit("post:like", data);
    });

    //-----------------------------------------
    // ✅ COMMENT ADDED
    //-----------------------------------------
    socket.on("post:comment:new", (data) => {
      io.emit("post:comment:new", data);
    });

    //-----------------------------------------
    // ✅ COMMENT EDITED
    //-----------------------------------------
    socket.on("post:comment:edit", (data) => {
      io.emit("post:comment:edit", data);
    });

    //-----------------------------------------
    // ✅ COMMENT DELETED
    //-----------------------------------------
    socket.on("post:comment:delete", (data) => {
      io.emit("post:comment:delete", data);
    });

    //-----------------------------------------
    // ✅ DISCONNECT LOG
    //-----------------------------------------
    socket.on("disconnect", () => {
      console.log("❌ PostEvents disconnected:", socket.id);
    });
  });
};

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productsRoute = require("./routes/products");
const ordersRoute = require("./routes/orders");
const categoriesRoute = require("./routes/categories");
const cartRoutes = require("./routes/cart");
const addressesRoute = require("./routes/addresses");
const { Server } = require("socket.io");
const http = require("http");
const carriersRoute = require("./routes/carriers");
const dashboardRoute = require("./routes/dashboard");
const adminRoute = require("./routes/admin");

const cors = require("cors");

dotenv.config();


mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>console.log("DB connection..."))
    .catch((err)=>{
        console.log(err)
    });

app.use(cors());

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Credentials", "true");
//     res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
//     res.header("Access-Control-Max-Age", "3600");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me, Authorization, type ");
//     res.header("Access-Control-Expose-Headers","Authorization");
//     next();
// });

app.use(express.json());
 
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productsRoute);
app.use("/api/orders", ordersRoute); 
app.use("/api/categories", categoriesRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressesRoute);
app.use("/api/carriers", carriersRoute);
app.use("/api/dashboard", dashboardRoute); 
app.use("/api/admin", adminRoute); 



const server = http.createServer(app);

// const io = require('socket.io')(server, );

 
const io = new Server(server, {
    cors: {origin: "*"}
//     cors: {
//     origin: "http://localhost:3000/",
//     // methods: ["GET", "POST"],
//     // allowedHeaders: ["my-custom-header"],
//     // credentials: true
//   },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on('orderStatusJoin', function(orderId) {
        console.log("SOCKET JOIN " + socket.id);
        console.log(orderId);
        socket.join(orderId);
    });
    socket.on('liveTrackingJoin', function(carrierID) {
        console.log("SOCKET JOIN " + socket.id);
        console.log(carrierID);
        socket.join(carrierID);
    });
    socket.on('ordersUpdateJoin', function(userID) {
        console.log("SOCKET JOIN " + socket.id);
        console.log("user JOIN - "+userID);
        socket.join(userID);
    }); 

    
    // socket.on('disc', function() {
    //     console.log("SOCKET DISC " + socket.id); 
    // }); 
 

    socket.on("disconnect", () => {
        console.log(socket.connected); // false
    });
});
 

app.set('socketio', io);
// export {io};





server.listen(process.env.PORT || 5000, ()=>{
    console.log("Backend server is running...");
});
// io.listen(5001); 

// 1kxkOOY8rTrASJfv
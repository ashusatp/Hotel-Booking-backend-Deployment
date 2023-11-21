require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const database = require("./database");
const router = require('./routes')
const cookieParser = require('cookie-parser');
const cors = require('cors')
database();
app.use(cookieParser());
const corsOption = {
    origin: [process.env.CLIENT_PORT],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}
app.use(cors(corsOption));
app.use(express.json());
app.use(router);

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));

const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const DB = require("./config/DB");
const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000
DB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    })
    .catch(() => {
        console.log("Failed to connect to DB, server not started");
    })

app.get("/", (req, res) => {
    res.send(`<h1>API is working</h1>`)
})

app.use("/api/auth", require("./router/userAuthRouter"))
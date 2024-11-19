require('dotenv').config()
const cors = require('cors')
const express = require('express')
const {graphqlHTTP} = require('express-graphql')
const colors = require('colors')

const schema = require('./Schema/schema')
const connectDB = require('./Config/db')
const PORT =  process.env.PORT || 3500

const app = express()

app.use(cors())


app.get("/test",(req,res)=>{
    res.send('You have reached Project Management')
})

app.all(
    "/graphql",
    graphqlHTTP({
        schema:schema,
        graphiql: process.env.ENV === 'development',
    })
)



connectDB()
.then(()=>
    app.listen(PORT, console.log(`server running on port ${PORT}`.green.underline.bold)))
.catch(()=>console.log("database not connected".red.underline.bold))
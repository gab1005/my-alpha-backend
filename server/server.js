const express = require('express')
const server = express()
const PORT = 9000
const cookieParser = require('cookie-parser')
const cors = require('cors')
const database = require('./queries')
const verifyJWT = require('./verify')

server.use(express.json())
server.use(cors({
    origin: ['http://localhost:3001'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
    //lembre de colocar credentials: true no fetch também quando for configurar as requisições do front
}))
server.use(cookieParser())

server.get('/', (req, res) => {
    res.send("Funcionando!")
})

server.get('/isUserAuth', verifyJWT, (req, res) => {
    console.log(req.user_id)
    res.send("Você está autorizado!")
})

server.post('/register', database.register)

server.post('/login', database.login)

server.get('/getForms', verifyJWT, database.getCustomers)

server.post('/postForms', database.insertCustomer) // To usando no lugar do register

server.put('/putForms', verifyJWT, database.updateCustomer)

server.put('/deleteLogicalForms', verifyJWT, database.deleteCustomer)


server.listen(PORT, () => console.log(`Server backend running on port ${PORT}`))
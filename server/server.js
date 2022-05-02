const express = require('express')
const server = express()
const PORT = 9000
const cookieParser = require('cookie-parser')
const cors = require('cors')
const database = require('./queries')
const verifyJWT = require('./verify')

server.use(express.json())
server.use(cors({
    origin: ['http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
    //lembre de colocar credentials: true no fetch também quando for configurar as requisições do front
}))
server.use(cookieParser())

server.get('/', (req, res) => {
    res.send("Funcionando!")
})

server.use('/static', express.static('public'))

server.get('/isUserAuth', verifyJWT, (req, res) => {
    console.log(req.user_id)
    res.send("Você está autorizado!")
})

server.post('/register', database.register)

server.post('/login', database.login)

server.get('/getForms', verifyJWT, database.getCustomers)

server.post('/postForms', database.insertCustomer) // To usando no lugar do register

server.get('/getBooks', database.getBooks) // To usando no lugar do register

server.put('/putForms', verifyJWT, database.updateCustomer)

server.put('/deleteLogicalForms', verifyJWT, database.deleteCustomer)

server.get('/logout', database.logout)

server.get('/getBooks', database.getBooks)

server.put('/putBooks', verifyJWT, database.updateBook)

server.post('/postBooks', database.insertBook)

server.put('/deleteLogicalBooks', database.deleteBook)

server.post('/upload', async (req, res) => {
    const { name, data} = req.files.pic;
    database.upload(name, data, res)
})

server.get('/getImage/:id', async (req, res) => {
    const { id } = req.params;
    database.getImage(id, res)
})

server.listen(PORT, () => console.log(`Server backend running on port ${PORT}`))
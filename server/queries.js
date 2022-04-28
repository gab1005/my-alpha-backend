const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const config = {
    user: 'postgres',
    database: 'react-winx',
    password: 'senha',
    port: 5432
};
const pool = new Pool(config);

// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// })

// app.get('/static/js/main.d6be7bb9.js', function (req, res) {
//   res.sendFile(join(__dirname, 'build', 'static', 'js', 'main.d6be7bb9.js'));
// })

// app.get('/static/css/main.d6be7bb9.css', function (req, res) {
//     res.sendFile(join(__dirname, 'build', 'static', 'css', 'main.807ee74c.css'));
// })

//GET/SELECT
function getCustomers(req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query('SELECT * FROM public.forms WHERE id = $1 AND deletat IS NULL', [req.user_id], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            let obj = result.rows;
            res.status(200).send(obj);
        })
    })
}

//POST/INSERT
async function insertCustomer(req, res) {
    const { name, email, phone, password, createAt } = req.body;
    bcrypt.hash(password, saltRounds, async (error, hash) => {
        if (error) {
            console.log(error)
        }

        console.log(hash)
        const query = {
            text: 'INSERT INTO public.forms(name, email, creatat, password) VALUES($1, $2, $3, $4)',
            values: [name, email, createAt, hash]
        };
        try {
            await pool.query(query);
            res.status(200).send('Form inserted');
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    })
}

//PUT/UPDATE
async function updateCustomer(req, res) {
    const {name, email} = req.body;
    const id = req.user_id
    const query = {
        text: 'UPDATE public.forms SET name = $1, email = $2 WHERE id = $3',
        values: [name, email, id]
    };
    try {
        await pool.query(query);
        res.status(200).send('Form updated');
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

//PHYSSICAL DELETE
// app.delete('/deleteForms', async function deleteCustomer(req, res) {
//     const { id } = req.body;
//     const query = {
//         text: 'DELETE FROM public.forms WHERE id = $1',
//         values: [id]
//     };
//     try {
//         await pool.query(query);
//         res.status(200).send('Form deleted');
//     } catch (err) {
//         console.log(err);
//         res.status(400).send(err);
//     }
// })

//LOGICAL DELETE
async function deleteCustomer(req, res) {
    console.log('delete aqui')
    const { deleteAt } = req.body;
    const id = req.user_id
    const query = {
        text: 'UPDATE public.forms SET deletat = $2 WHERE id = $1',
        values: [id, deleteAt]
    };
    try {
        await pool.query(query);
        res.status(200).send('Form logical deleted');
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

// //POST CARTAO
// app.post('/postCartao', async function insertCartao(req, res) {
//     const { name, number, validade, cds, userId, createAt } = req.body;
//     const query = {
//         text: 'INSERT INTO public.cartao(nome, numero, validade, cds, id_usuario, creatat) VALUES($1, $2, $3, $4, $5, $6)',
//         values: [name, parseInt(number), validade, parseInt(cds), parseInt(userId), createAt]
//     };
//     try {
//         await pool.query(query);
//         res.status(200).send('Cartao inserted');
//     } catch (err) {
//         console.log(err);
//         res.status(400).send(err);
//     }
// })

// //GET/SELECT CARTAO
// app.get('/getCartao', function (req, res) {
//     pool.connect(function (err, client, done) {
//         if (err) {
//             console.log("Can not connect to the DB" + err);
//         }
//         client.query(`SELECT * FROM public.cartao WHERE public.cartao.id_usuario IN (${req.query.userId})`, function (err, result) {
//             done();
//             if (err) {
//                 console.log(err);
//                 res.status(400).send(err);
//             }
//             let obj = result.rows;
//             res.status(200).send(obj);
//         })
//     })
// })

// async function connection(query, params = null) {
//     const client = initClient()
//     client.connect()
//     let res
//     let resultado = {
//         content: {},
//         message: 'default'
//     }
//     try {
//         res = await client.query(query, params)
//         resultado.content = res.rows
//         resultado.message = 'Sua query foi executada com sucesso!'
//     } catch (error) {
//         console.log(error)
//         resultado.message = 'Sua query deu erro!'
//     }
//     console.log(resultado)
//     await client.end()
//     return resultado
// }

const register = async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    bcrypt.hash(password, saltRounds, async (error, hash) => {
        if (error) {
            console.log(error)
        }

        console.log(hash)
        const query = "INSERT INTO accounts (name, password, email) VALUES ($1, $2, $3)"
        const params = [username, hash, email]

        try {
            await pool.query(query, params);
            res.status(200).send('Form inserted');
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
        // res.json(json)
    })
}

const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const query = 'SELECT * FROM forms WHERE email = $1'

    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(query, [email], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            let obj = result.rows;
            console.log(obj)
            if (obj.length > 0) {
                bcrypt.compare(password, obj[0].password, (error, itsTheSame) => {
                    if (error) {
                        console.log(error)
                    }

                    obj[0].isAuthenticated = itsTheSame
                    if (itsTheSame) {
                        const id = obj[0].id
                        console.log(id)
                        const token = jwt.sign( { id } , 'secret', {
                            expiresIn: 3000
                        })
                        console.log({ authorized: true, token: token, result: obj[0] })

                        res.cookie('access_token', token, { httpOnly: true }).json({ authorized: true, token: token, result: obj[0] })
                    } else {
                        res.json({ auth: false, message: "Wrong password/username combination!" })
                    }
                })
            } else {
                res.json({ auth: false, message: "User doesn't exist!" })
            }

            // res.status(200).send(obj);
        })
    })
}

    const logout = (req, res) => {
        res.cookie('access_token', '', {expiresIn: 1}).json({message: "You have been logged out!"})
        // res.redirect('/') // usar isso pra redirecionar para pagina de login
    }

module.exports = {
    getCustomers,
    insertCustomer,
    updateCustomer,
    deleteCustomer,
    logout,
    register,
    login
}
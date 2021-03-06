const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const pool = require('./database-configs')

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
        client.query('SELECT * FROM public.users WHERE id = $1 AND deletedAt IS NULL', [req.user_id], function (err, result) {
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
    const { name, email, birthdate, password, fullName } = req.body;
    bcrypt.hash(password, saltRounds, async (error, hash) => {
        if (error) {
            console.log(error)
        }

        console.log(hash)
        const query = {
            text: 'INSERT INTO public.users(username, email, password, birthdate, fullname) VALUES($1, $2, $3, $4, $5)',
            values: [name, email, hash, birthdate, fullName]
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
    const { name, email } = req.body;
    const id = req.user_id
    const query = {
        text: 'UPDATE public.users SET username = $1, email = $2 WHERE id = $3',
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
// app.delete('/deleteusers', async function deleteCustomer(req, res) {
//     const { id } = req.body;
//     const query = {
//         text: 'DELETE FROM public.users WHERE id = $1',
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
    const id = req.user_id
    const query = {
        text: 'UPDATE public.users SET deletedAt = CURRENT_TIMESTAMP WHERE id = $1',
        values: [id]
    };
    try {
        await pool.query(query);
        res.status(200).send('Form logical deleted');
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

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
    const identifier = req.body.identifier
    const password = req.body.password

    const query = 'SELECT * FROM users WHERE email = $1 OR username = $1'

    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(query, [identifier], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            let obj = result.rows;
            console.log(obj)

            //Check if there is any results (array greater than 0)
            if (obj.length > 0) {
                bcrypt.compare(password, obj[0].password, (error, itsTheSame) => {
                    if (error) {
                        console.log(error)
                    }

                    obj[0].isAuthenticated = itsTheSame
                    if (itsTheSame) {
                        const id = obj[0].id
                        console.log(id)
                        const token = jwt.sign({ id }, 'secret', {
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
        })
    })
}

const logout = (req, res) => {
    res.cookie('access_token', '', { expiresIn: 1 }).json({ message: "You have been logged out!" })
    // res.redirect('/') // usar isso pra redirecionar para pagina de login
}

// const getBooks = (req, res) => {
//     res.json([
//         {
//             title: "ldsfkjls",
//             author: "ldsfkjls",
//             publisher: "ldsfkjls",
//             gender: "ldsfkjls",
//             pub_year: "ldsfkjls"
//         },
//         {
//             title: "odfius",
//             author: "sdlkfj",
//             publisher: "sdlfj",
//             gender: "lfskjd",
//             pub_year: "kldjfls"
//         }]
//     )
// }

async function updateBook(req, res) {
    const {id, title, author, publisher, gender, pub_year} = req.body;
    const query = {
        text: 'UPDATE public.books SET title = $1, author = $2, publisher = $3, gender = $4, pub_year = $5 WHERE id = $6',
        values: [title, author, publisher, gender, parseInt(pub_year), id]
    };
    try {
        console.log([title, author, publisher, gender, parseInt(pub_year), id]);
        await pool.query(query);
        res.status(200).send('Form updated');
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

function getBooks(req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query('SELECT * FROM public.books WHERE deletedAt IS NULL', function (err, result) {
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

async function insertBook(req, res) {
    console.log('booooooooook')
    const { title, author, publisher, gender, pub_year} = req.body;

        const query = {
            text: 'INSERT INTO public.books(title, author, publisher, gender, pub_year) VALUES($1, $2, $3, $4, $5)',
            values: [title, author, publisher, gender, pub_year]
        };
        try {
            await pool.query(query);
            res.status(200).send('Form inserted');
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
}

async function deleteBook(req, res) {
    console.log('delete aqui')
    const { id} = req.body;
    console.log(id)
    const query = {
        text: 'UPDATE public.books SET deletedAt = CURRENT_TIMESTAMP WHERE id = $1',
        values: [parseInt(id)]
    };
    try {
        await pool.query(query);
        res.status(200).send('Form logical deleted');
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
}

async function upload(name, data, res) {
        const query = {
            text: 'INSERT INTO public.img(name, img) VALUES($1, $2)',
            values: [name, data]
        };
        try {
            await pool.query(query);
            res.status(200).send('Form inserted');
        } catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
}

async function getImage(id, res) {
    const query = {
        text: 'SELECT * FROM public.img WHERE id = $1',
        values: [id]
    };
    try {
        const result = await pool.query(query);
        res.status(200).send(result.rows[0].img);
    } catch (err) { 
        console.log(err);
        res.status(400).send(err);
    }
}
module.exports = {
    getCustomers,
    getBooks,
    upload,
    getImage,
    insertCustomer,
    updateCustomer,
    updateBook,
    deleteCustomer,
    insertBook,
    deleteBook,
    logout,
    register,
    login
}
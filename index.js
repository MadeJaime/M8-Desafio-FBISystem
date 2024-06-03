//Módulos 
const express = require('express');
const agentes = require('./data/agentes.js');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const secretKey = 'Mi Llave Ultra Secreta';

//Configurar Express .
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//Iniciar el servidor
app.listen(3000, () => console.log('Servidor encendido en el puerto 3000'));

//Autentica y genera token.
app.get('/SignIn', (req, res) => {
    const { email, password } = req.query;

    //Buscar al usuario BBDD
    const user = agentes.results.find((u) => u.email === email && u.password === password);

    if (user) {
        //Genera token con tiempo de expiración.
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: user,
            },
            secretKey
        );

        //Se envia respuesta con el token y un enlace al área restringida.
        res.send(`
            <a href="/restringida?token=${token}"> <p> Ir al área restringida </p> </a>
            AGENTE AUTORIZADO, ${email}.
            <script>
                localStorage.setItem('token', JSON.stringify("${token}"))
            </script>
            <img style="width: 100%;" src="/assets/img/wp5008191.webp" alt="Mi imagen">
        `);
    } else {
        //Si las credenciales son incorrectas, se envia un mensaje de error.
        res.send(`
        USUARIO NO AUTORIZADO, CREDENCIAL INCORRECTA
        <img style="width: 100%;" src="/assets/img/password incorrecto.jpg" alt="Error">
    `);
    }
});

//Acceso al área restringida.
app.get('/restringida', (req, res) => {
    let { token } = req.query;

    //Verificar validez del token.
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            //error en verificación, código de error 401.
            res.status(401).send({
                error: '401 Unauthorized',
                message: err.message,
            });
        } else {
            //Si el token es válido, se envia un mensaje de bienvenida
            res.send(`
            <h1 >BIENVENIDO AL AREA RESTRINGIDA ${decoded.data.email}</h1>
            <img style="width: 100%;" src="/assets/img/FBI.jpg" alt="Mi imagen">
        `);
        }
    });
});
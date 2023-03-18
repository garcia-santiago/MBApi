const { Router } = require('express')
const router = Router()

const connection = require('../../db');

const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')
const {SECRET} = require('../../config')

router.post('/registro', (req, res) => {

    const {nombre, password, email} = req.body
    const id = Math.random() * (9999999 - 1000000) + 1000000

    try {    
        connection.query(
          "SELECT userEmail FROM `users` WHERE userEmail=?", 
          email, 
          function (err, result) {
            if (err){
              res.status(400).send(err)
            }
            // Si no se encuentra registro, realizar la otra consulta
            if(result[0]== undefined){

              bcrypt.hash(password, saltRounds, function(err, hash) {

                if (err) throw err;

                connection.query(
                  "INSERT INTO users (userId, userNombre, userEmail, userPassword) VALUES (?, ?, ?, ?)",[
                  id, nombre, email, hash], 
                  function (err, result) {
                    if (err) throw err;
                    // ENVIAR CORREO
                    res.status(200).send({"msg": "Registro correcto."})

                  })
              });

            }
            else{
              res.status(400).send({"msg":"Usuario ya registrado"})
            }
          
        });
      } catch (error) {
        res.status(400).send(error.message)
      }
})

router.post('/login', (req, res) => {
  const {email, password} = req.body
  try {
        connection.query(
          "SELECT * FROM `users` WHERE userEmail=?", 
          email, 
          function (err, result) {
            if (err){
              res.status(400).send(err)
              res.end()
            };
            // Si no se encuentra registro, enviar error
            if(result.length == 0){
              res.status(400).send({"msg":"Usuario no registrado"})

            }
            // Usuario registrado, comprobar contraseña
            else{
              const hash = result[0].userPassword.toString();

              //Contraseña correcta
              bcrypt.compare(password.toString(), hash, function(err,response){
                if (err){
                  res.status(400).send(err)
                }
                else if(response){
                  //Correcta
                  const token = jwt.sign(
                    {
                      userId: result[0].userId
                    },
                    SECRET
                  )
                  res.status(200).send({"token": token, "userEmail": result[0].userEmail, 'userName': result[0].userNombre})
                }
                //Contraseña incorrecta
                else{
                  res.status(400).send({"msg":"Contraseña incorrecta"})
                }
              })
            }
          
        });    
  } catch (error) {
    res.status(400).send(error.message)
  }
})

module.exports = router
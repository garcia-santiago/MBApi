const { Router } = require('express')
const router = Router()

const connection = require('../../db');

const jwt = require('jsonwebtoken')
const {SECRET} = require('../../config')

router.post('/registro/', (req, res) => {
    try {
        const {token} = req.body;
        const {userId} = jwt.verify(token, SECRET)

        const {evento, monto, cuota} = req.body
        const id = Math.floor(Math.random() * (9999999 - 1000000) + 1000000)

        const insert_sql = "INSERT INTO apuestas (id, userId, evento, monto, cuota, estado) VALUES (?, ?, ?, ?, ?, ?)";

        connection.query(insert_sql, [id, userId, evento, monto, cuota, 0], function (err, result) {
            if (err) throw err;
            res.status(200).send({"msg": "Ingreso correcto!"});
        });

    } catch (error) {
        res.status(400).send(error.message);
    }
})

router.post('/actualizar/', (req, res) => {
    try {
        const {token} = req.body;
        const {userId} = jwt.verify(token, SECRET)

        const {id, evento, monto, cuota, estado} = req.body

        let pago=0
        let utilidad=0

        if(estado==1){
            pago=monto
        }
        else if(estado==2){
            pago=monto*cuota
        }
        else if(estado==3){
            pago=0
        }
        utilidad=pago-monto


        const insert_sql = "UPDATE apuestas SET evento=?, monto=?, cuota=?, estado=?, pago=?, utilidad=? WHERE id=? AND userId=?";

        connection.query(insert_sql, [evento, monto, cuota, estado, pago, utilidad, id, userId], function (err, result) {
            if (err){
                res.status(400).send(err)
            }
            else if(result.affectedRows == 0){
                res.status(400).send({"msg": "No actualizado por error!"});
            }
            else{
                res.status(200).send({"msg": "Actualizado correctamente!"});
            }
        });

    } catch (error) {
        res.status(400).send(error.message);
    }
})

router.post('/eliminar/', (req, res) => {
    try {
        const {token} = req.body;
        const {userId} = jwt.verify(token, SECRET)

        const {id} = req.body

        const deleteSQL = "DELETE FROM apuestas WHERE id=? AND userId=?";

        connection.query(deleteSQL, [id, userId], function (err, result) {
            if (err){
                res.status(400).send(err)
            }
            else if(result.affectedRows == 0){
                res.status(200).send({"msg": "No eliminada por error!"});
            }
            else{
                res.status(200).send({"msg": "Eliminada correctamente!"});
            }
        });

    } catch (error) {
        res.status(400).send(error.message);
    }
})
//Enviar apuestas del usuario loggeado
router.post('/obtenerTodas/', (req, res) => {
    try{
        const {token} = req.body;
        const {userId} = jwt.verify(token, SECRET)

        connection.query("SELECT id, evento, monto, cuota, estado, pago, utilidad FROM apuestas WHERE userId=?", userId, function (err, result) {
            if (err) {
                res.status(400).send(err)
            }
            else if(result.length == 0){
                res.status(200).send({"msg": "El usuario no tiene apuestas!"});
            }
            else{
                res.status(200).send({"msg": "Encontradas apuestas correctamente!", "apuestas": result});
            }
        })

    } catch(error){
        res.status(400).send(error.message);
    }
    
})
module.exports = router
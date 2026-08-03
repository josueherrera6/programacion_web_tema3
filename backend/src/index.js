import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

const puerto = Number(process.env.PORT ?? 3000);


// -----------------------------
// Configuración de middleware
// -----------------------------
app.use(cors());
app.use(express.json());


// -----------------------------
// Conexión a MySQL Railway
// -----------------------------
const conexion = mysql.createPool({

    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT ?? 3306),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,

    decimalNumbers: true
});


// -----------------------------
// Ruta de prueba
// -----------------------------
app.get('/', (req, res)=>{

    res.json({
        mensaje:"Backend funcionando correctamente"
    });

});


// -----------------------------
// Obtener todos los productos
// GET /api/productos
// -----------------------------
app.get('/api/productos', async (req,res)=>{

    try {

        const [productos] = await conexion.query(
            `
            SELECT 
                id,
                nombre,
                descripcion,
                precio,
                creado_en
            FROM productos
            ORDER BY id
            `
        );


        res.json(productos);


    } catch(error){

        console.error("Error MySQL:", error);


        res.status(500).json({

            mensaje:"Error al consultar productos",
            error:error.message

        });

    }

});


// -----------------------------
// Obtener producto por ID
// GET /api/productos/:id
// -----------------------------
app.get('/api/productos/:id', async(req,res)=>{

    try{

        const [productos] = await conexion.execute(

            `
            SELECT 
                id,
                nombre,
                descripcion,
                precio,
                creado_en
            FROM productos
            WHERE id = ?
            `,

            [req.params.id]

        );


        if(productos.length === 0){

            return res.status(404).json({

                mensaje:"Producto no encontrado"

            });

        }


        res.json(productos[0]);


    }catch(error){

        console.error(error);

        res.status(500).json({

            mensaje:"Error al consultar producto"

        });

    }

});


// -----------------------------
// Crear producto
// POST /api/productos
// -----------------------------
app.post('/api/productos', async(req,res)=>{

    try{

        const {nombre, descripcion, precio} = req.body;


        const [resultado] = await conexion.execute(

            `
            INSERT INTO productos
            (nombre,descripcion,precio)
            VALUES (?,?,?)
            `,

            [nombre,descripcion,precio]

        );


        res.status(201).json({

            id:resultado.insertId,
            nombre,
            descripcion,
            precio

        });


    }catch(error){

        console.error(error);

        res.status(500).json({

            mensaje:"Error al guardar producto"

        });

    }

});


// -----------------------------
// Actualizar producto
// PUT /api/productos/:id
// -----------------------------
app.put('/api/productos/:id', async(req,res)=>{


    try{

        const {nombre,descripcion,precio}=req.body;


        const [resultado]=await conexion.execute(

            `
            UPDATE productos
            SET nombre=?, descripcion=?, precio=?
            WHERE id=?
            `,

            [
                nombre,
                descripcion,
                precio,
                req.params.id
            ]

        );


        if(resultado.affectedRows===0){

            return res.status(404).json({

                mensaje:"Producto no encontrado"

            });

        }


        res.json({

            mensaje:"Producto actualizado"

        });


    }catch(error){

        console.error(error);

        res.status(500).json({

            mensaje:"Error al actualizar"

        });

    }


});


// -----------------------------
// Eliminar producto
// DELETE /api/productos/:id
// -----------------------------
app.delete('/api/productos/:id', async(req,res)=>{


    try{


        const [resultado]=await conexion.execute(

            `
            DELETE FROM productos
            WHERE id=?
            `,

            [req.params.id]

        );


        if(resultado.affectedRows===0){

            return res.status(404).json({

                mensaje:"Producto no encontrado"

            });

        }


        res.status(204).send();



    }catch(error){

        console.error(error);

        res.status(500).json({

            mensaje:"Error al eliminar"

        });

    }


});



// -----------------------------
// Inicio servidor
// -----------------------------
app.listen(puerto,'0.0.0.0',()=>{

    console.log(`Servidor corriendo en puerto ${puerto}`);

});
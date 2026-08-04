import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';


const app = express();

const puerto = Number(process.env.PORT ?? 3000);


// =============================
// MIDDLEWARE
// =============================

app.use(cors());
app.use(express.json());



// =============================
// CONEXIÓN MYSQL RAILWAY
// =============================

const conexion = mysql.createPool({

    host: process.env.MYSQLHOST,

    port: Number(process.env.MYSQLPORT ?? 3306),

    user: process.env.MYSQLUSER,

    password: process.env.MYSQLPASSWORD,

    database: process.env.MYSQLDATABASE,

    waitForConnections:true,

    connectionLimit:5,

    queueLimit:0,

    decimalNumbers:true

});



// =============================
// PRUEBA BACKEND
// =============================

app.get('/',(req,res)=>{


    res.json({

        mensaje:"Backend funcionando correctamente"

    });


});




// =================================================
// PRODUCTOS
// =================================================


// Obtener productos con categoría

app.get('/api/productos',async(req,res)=>{


try{


const [productos]=await conexion.query(

`

SELECT

productos.id,
productos.nombre,
productos.descripcion,
productos.precio,
productos.creado_en,

categorias.id AS categoria_id,
categorias.nombre AS categoria


FROM productos


LEFT JOIN categorias

ON productos.categoria_id = categorias.id


ORDER BY productos.id


`

);


res.json(productos);



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error al consultar productos",

error:error.message

});


}


});




// Obtener producto por id

app.get('/api/productos/:id',async(req,res)=>{


try{


const [producto]=await conexion.execute(

`

SELECT

productos.*,

categorias.nombre AS categoria


FROM productos


LEFT JOIN categorias

ON productos.categoria_id=categorias.id


WHERE productos.id=?


`,

[req.params.id]


);



if(producto.length===0){

return res.status(404).json({

mensaje:"Producto no encontrado"

});

}



res.json(producto[0]);



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error"

});


}


});





// Crear producto

app.post('/api/productos',async(req,res)=>{


try{


const {

nombre,

descripcion,

precio,

categoria_id


}=req.body;



const [resultado]=await conexion.execute(


`

INSERT INTO productos

(nombre,descripcion,precio,categoria_id)

VALUES(?,?,?,?)


`,

[

nombre,

descripcion,

precio,

categoria_id

]


);



res.status(201).json({

id:resultado.insertId,

nombre,

descripcion,

precio,

categoria_id


});



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error al crear producto"

});


}


});






// Actualizar producto


app.put('/api/productos/:id',async(req,res)=>{


try{


const {

nombre,

descripcion,

precio,

categoria_id


}=req.body;




await conexion.execute(

`

UPDATE productos

SET

nombre=?,

descripcion=?,

precio=?,

categoria_id=?


WHERE id=?


`,

[

nombre,

descripcion,

precio,

categoria_id,

req.params.id

]


);



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






// Eliminar producto


app.delete('/api/productos/:id',async(req,res)=>{


try{


await conexion.execute(

`

DELETE FROM productos

WHERE id=?

`,

[req.params.id]


);



res.json({

mensaje:"Producto eliminado"

});



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error al eliminar"

});


}


});






// =================================================
// CATEGORIAS
// =================================================



// Obtener categorias


app.get('/api/categorias',async(req,res)=>{


try{


const [categorias]=await conexion.query(

`

SELECT *

FROM categorias

ORDER BY id

`

);



res.json(categorias);



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error categorias"

});


}


});





// Crear categoria


app.post('/api/categorias',async(req,res)=>{


try{


const {

nombre,

descripcion

}=req.body;



const [resultado]=await conexion.execute(

`

INSERT INTO categorias

(nombre,descripcion)

VALUES(?,?)

`,

[

nombre,

descripcion

]


);



res.json({

id:resultado.insertId,

nombre,

descripcion


});



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error crear categoria"

});


}


});





// Actualizar categoria


app.put('/api/categorias/:id',async(req,res)=>{


try{


const {

nombre,

descripcion

}=req.body;



await conexion.execute(

`

UPDATE categorias

SET

nombre=?,

descripcion=?


WHERE id=?


`,

[

nombre,

descripcion,

req.params.id

]


);



res.json({

mensaje:"Categoria actualizada"

});



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error actualizar categoria"

});


}


});






// Eliminar categoria


app.delete('/api/categorias/:id',async(req,res)=>{


try{


await conexion.execute(

`

DELETE FROM categorias

WHERE id=?

`,

[req.params.id]


);



res.json({

mensaje:"Categoria eliminada"

});



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error eliminar categoria"

});


}


});






// =================================================
// FAVORITOS
// =================================================



// Obtener favoritos


app.get('/api/favoritos',async(req,res)=>{


try{


const [favoritos]=await conexion.query(

`

SELECT

productos.*

FROM favoritos


INNER JOIN productos

ON favoritos.producto_id = productos.id


`

);



res.json(favoritos);



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error favoritos"

});


}


});






// Agregar favorito


app.post('/api/favoritos',async(req,res)=>{


try{


const {producto_id}=req.body;



await conexion.execute(

`

INSERT INTO favoritos(producto_id)

VALUES(?)

`,

[producto_id]

);



res.json({

mensaje:"Favorito agregado"

});



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error agregar favorito"

});


}


});







// Eliminar favorito


app.delete('/api/favoritos/:id',async(req,res)=>{


try{


await conexion.execute(

`

DELETE FROM favoritos

WHERE producto_id=?

`,

[req.params.id]

);



res.json({

mensaje:"Favorito eliminado"

});



}catch(error){


console.error(error);


res.status(500).json({

mensaje:"Error eliminar favorito"

});


}


});






// =============================
// INICIO SERVIDOR
// =============================


app.listen(

puerto,

'0.0.0.0',

()=>{


console.log(

`Servidor corriendo en puerto ${puerto}`

);


}

);
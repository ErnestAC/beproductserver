import express from 'express'
import AlumnosRoute from './routes/alumnos.route.js'
import ProductosRoute from './routes/productos.route.js'
import { __dirname } from './utils.js'
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use('/static',express.static(__dirname + '/public')) // le indicamos a express que en dicha carpeta sirva todo lo estatico al cliente

app.use('/api/products/', ProductosRoute)

app.listen(8080, ()=>{
    console.log('Servidor ON en puerto 8080')
})

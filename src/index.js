import express from 'express'

import ProductsRoute from './routes/products.route.js'
import { __dirname } from './utils.js'
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 
app.use('/static',express.static(__dirname + '/public')) // serve all contents of the 'public' directory

app.use('/api/products/', ProductsRoute)

app.listen(8080, ()=>{
    console.log('Server started on port 8080')
})

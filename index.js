const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(express.json())
app.use(
    cors({
        origin: true,
        credentials: true,
    })
)

const users = []
const comments = []
let favorites = []
const visits = []

app.get('/login', (req, res) => {
    const userToken = req.cookies.token
    if (userToken === undefined) {
        let token = Math.floor(Math.random() * 100000000)
        while (users.includes(token)) {
            token = Math.floor(Math.random() * 100000000)
        }
        users.push(token)
        res.cookie('token', token)
        res.send('Login successful with token: ' + token)
    } else {
        res.send('You are logged in with token: ' + userToken)
    }
    console.log('users: ' + users)
})

app.get('/users', (req, res) => {
    res.send(users)
})

app.post('/comment', (req, res) => {
    const { text, token, type } = req.body
    if (!text || !token || !type) {
        res.status(400).send('Invalid request')
        return
    }
    comments.push({ text, token, type })
    console.log('comments: ' + JSON.stringify(comments))
    res.status(200).send('Comment saved')
})

app.get('/comments', (req, res) => {
    console.log('comments: ' + comments)
    res.header('Content-Type', 'application/json')
    res.send(comments)
})

app.get('/favorite', (req, res) => {
    const { token, pizzaType } = req.query
    if (!token) {
        res.status(400).send('Invalid request')
        return
    }
    const isFavorite = favorites.some(
        (fav) => fav.token === token && fav.pizzaType === pizzaType
    )
    res.status(200).send({ isFavorite })
})

app.post('/favorite', (req, res) => {
    const { token, pizzaType } = req.body
    if (!token || !pizzaType) {
        res.status(400).send('Invalid request')
        return
    }
    const isAlreadyFavorite = favorites.some(
        (fav) => fav.token === token && fav.pizzaType === pizzaType
    )
    if (isAlreadyFavorite) {
        return
    }
    favorites.push({ token, pizzaType })
    console.log('favorites: ' + JSON.stringify(favorites))
    res.status(200).send('Favorite saved')
})

app.delete('/favorite', (req, res) => {
    const { token, pizzaType } = req.query
    if (!token || !pizzaType) {
        res.status(400).send('Invalid request')
    }
    favorites = favorites.filter((fav) => {
        return !(fav.token === token && fav.pizzaType === pizzaType)
    })
    console.log('favorites: ' + JSON.stringify(favorites))
    res.status(200).send('Favorite deleted')
})

app.post('/visit', (req, res) => {
    const { token, pizzaType } = req.body
    if (!token) {
        res.status(400).send('Invalid request')
        return
    }
    const visitIndex = visits.findIndex(
        (visit) => visit.token === token && visit.pizzaType === pizzaType
    )
    console.log('visitIndex: ' + visitIndex)
    if (visitIndex >= 0) {
        visits[visitIndex].count++
    } else {
        visits.push({ token, pizzaType, count: 1 })
    }
    console.log('visits: ' + JSON.stringify(visits))
    res.status(200).send('Visit saved')
})

app.get('/top3', (req, res) => {
    const { token } = req.query
    if (!token) {
        res.status(400).send('Invalid request')
        return
    }
    const userVisits = visits.filter((visit) => visit.token === token)
    const topVisits = userVisits.sort((a, b) => b.count - a.count).slice(0, 3)
    res.status(200).send(topVisits)
})

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})

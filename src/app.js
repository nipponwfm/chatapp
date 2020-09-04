const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const moment = require('moment')
const { addUser, removeUser, getUsersByRoom, getUserBySocketID } = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath))

app.get('', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/templates/views/access.html'))
    } catch (e) {
        res.status(404).send(e.message)
    }
})

app.get('/chatroom', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/templates/views/chatroom.html'))
    } catch (e) {
        res.status(404).send(e.message)
    }
})

app.get('/getuserinroom', async (req, res) => {
    try {
        const user = getUsersByRoom(req.query.room)
        var getUser = [];
        if (user.length != 0) {
            getUser = user.filter( (value) => {
                return value.name==req.query.name
            })
        }
        res.send(getUser)
    } catch (e) {
        res.status(404).send(e.message)
    }
})

io.on('connection', (socket) => {
    socket.on('join', ({name, room}) => {
        socket.join(room)
        let error = addUser(name, room, socket.id)
        if (error) {
            socket.emit('userTaken', error)
        } else {
            socket.emit('showMessage', { message: 'Welcome', name, time: moment().format('LT'), body: 'me', error})
            socket.broadcast.to(room).emit('showMessage', {message: `${name} has joined the room`, name, time: moment().format('LT')})
            io.to(room).emit('showUser', {user:getUsersByRoom(room), room})
        }
    })
    socket.on('sendMessage', ({message, name, room, longitude, latitude}) => {
        if (longitude) message = `https://www.google.com/maps?q=${latitude},${longitude}`
        socket.emit('showMessage', { message, name, time: moment().format('LT'), body: 'me' })
        socket.broadcast.to(room).emit('showMessage', { message, name, time: moment().format('LT') })
    })

    socket.on('disconnect', () => {
        const user = getUserBySocketID(socket.id)
        if (user) {
            const {name, room, socketid} = user
            socket.broadcast.to(room).emit('showMessage', {message: `${name} has left the room`, name, time: moment().format('LT')})
            removeUser(socketid)
            io.to(room).emit('showUser', ({user: getUsersByRoom(room), room}))
        }
    })
})

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log('Server is up')
})

//continue error
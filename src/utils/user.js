var user = []

addUser = (name, room, socketid) => {
    const newUser = user.find((value) => {
        return value.name === name && value.room === room
    })
    if (newUser) return 'Oops... look like your user\'s name have been taken'
    user.push({ name, room, socketid })
}

removeUser = (socketid) => {
    user = user.filter((value) => {
        return value.socketid !== socketid
    })
}

getUsersByRoom = (room) => {
    const getUsers = user.filter((value) => {
        return value.room === room
    })
    return getUsers
}

getUserBySocketID = (socketid) => {
    const getUser = user.filter((value) => {
        return value.socketid === socketid
    })
    return getUser[0]
}

module.exports = {
    addUser,
    removeUser,
    getUsersByRoom,
    getUserBySocketID
}
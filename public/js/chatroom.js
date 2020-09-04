const socket = io()
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const userTemplate = document.querySelector("#user-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
//elements
const $messageContainer = document.querySelector('#message-container')
const $messageSend = document.querySelector("#message-send")
const $sideBar = document.querySelector("#sidebar-field")
const $sendButton = document.querySelector("#sendBtn")
const $message = document.querySelector("#messageInput")
const $sendLocation = document.querySelector("#sendLocation")

const {name, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })
var indexNewLine = []
var afterRender = ''

onWindowResize = () => {
    const $sideBar_title = $sideBar.querySelector("#title")
    const $sideBar_user = $sideBar.querySelector("#user")
    $sideBar_user.style.height = innerHeight - ($sideBar_title.offsetTop + $sideBar_title.offsetHeight + 20) + 'px'//20 equal to #user margin-top
    $messageContainer.style.height = innerHeight * 0.8 + 'px'
    $messageSend.style.height = innerHeight * 0.2 + 'px'
}

sendMessage = (e) => {
    e.preventDefault()
    if ($message.value) {
        stopTyping(true)
        socket.emit('sendMessage', {message:$message.value, name, room})
        $message.value = ''
    }
}

stopTyping = (value) => {
    $sendButton.disbled = value
    $message.disabled = value
    $message.focus()
}

autoScrollBar = () => {
    //copy :D
    //New message appear
    const $newMessage = $messageContainer.lastElementChild

    //Height of new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messageContainer.offsetHeight
    //height of messages container
    const containerHeight = $messageContainer.scrollHeight
    //how far have i scrolled
    const scrollOffset = $messageContainer.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messageContainer.scrollTop = $messageContainer.scrollHeight
    }
}

insertString = (string, value, index, indexOfNewLine) => {
    if (indexOfNewLine) index += 4 * indexOfNewLine
    let first = ''
    let last = ''
    for (var i=0;i<index;i++) first += string[i]
    for (var i = index; i<string.length;i++) last += string[i]
    afterRender = first + value + last
}

renderViewSide = html => {
    let detectClass = /messageBubble/g
    let index = html.search(detectClass) + 13
    insertString(html, " right", index)
    detectClass = /tooltip/g
    index = afterRender.search(detectClass) + 7
    insertString(afterRender, " tipright", index)
    return afterRender
}

renderNewLineMessage = (html, message) => {
    afterRender = message
    const detectMessageInsert = /message">/g
    let index = html.search(detectMessageInsert) + 9
    indexNewLine.forEach((value, index) => insertString(afterRender, "<br>", value, index))
    indexNewLine = []
    insertString(html, afterRender, index)
    return afterRender
}

//socket
socket.emit('join', {name, room})

socket.on('userTaken', (error) => {
    alert(error)
    location.href = '/'
})

socket.on('showMessage', ({message, name, time, body}) => {
    var html = Mustache.render(message.includes("maps?q=")?locationTemplate:messageTemplate, {
        message: indexNewLine.length!=0?'':message,
        name,
        time
    })
    if (body) html = renderViewSide(html)
    if (indexNewLine.length==0) $messageContainer.insertAdjacentHTML("beforeend", html)
    else $messageContainer.insertAdjacentHTML("beforeend",renderNewLineMessage(html, message))
    stopTyping(false)
    autoScrollBar()
})
socket.on('showUser', ({user, room}) => {
    const html = Mustache.render(userTemplate, {
        user,
        room
    })
    $sideBar.innerHTML = html
    onWindowResize()
})

$sendLocation.addEventListener("click", () => {
    stopTyping(true)
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendMessage', {message: '', name, room, longitude: position.coords.longitude, latitude: position.coords.latitude})
    })
})

//sendMessage()
$sendButton.addEventListener("click", sendMessage)
$message.addEventListener('keydown', (e) => {
    if (e.getModifierState("Shift")&&e.key=="Enter") indexNewLine.push($message.value.length)
    else if (e.key == "Enter") sendMessage(e)
})

window.addEventListener('resize', () => {
    onWindowResize();
})
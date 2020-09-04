const $room = document.querySelector("#room")
const $name = document.querySelector("#name")
const $error = document.querySelector("#error-container")

const maxValue = 999999
const minValue = 100000
const roomID = Math.floor(Math.random() * (maxValue-minValue+1) + minValue)

$room.placeholder = roomID

window.addEventListener('submit', async (e) => {
    e.preventDefault()
    $error.textContent = 'Connecting...'
    if (!$room.value) $room.value = roomID
    let room = $room.value
    let name = $name.value
    fetch(`/getuserinroom?room=${room}&name=${name}`)
    .then( (response) => response.json())
    .then((data) => {
        if(data.length==1) {
            $error.style.color = "red"
            $error.textContent = "Oops... look like your user\'s name have been taken"
        }
        else location.href = `/chatroom?room=${room}&name=${name}`
    })
})
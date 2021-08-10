const socket= io() //io function from the client side socket.io script/library that we loaded in the body of index.js
    //when initializing the connection, this allows receiving from server and sending to server

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $LocationButton=document.querySelector('#send-location');
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector("#location-message-template").innerHTML
const sidebarTemplate= document.querySelector('#sidebar-template').innerHTML

//Options
const queryString = window.location.search //we can grab the query string using window.location.search from the URL
const urlParams = new URLSearchParams(queryString); //parse the query string’s parameters using URLSearchParams:
const username = urlParams.get('username') //will return the first value associated with the "username" in the query string:
const room= urlParams.get('room')
// console.log(urlParams)
// console.log(username);

const autoscroll =()=>{ //a function we created for autoscrolling when user sends a message
    //New message element
    const $newMessage=$messages.lastElementChild

    //Height of the new message
    const newMessageStyles= getComputedStyle($newMessage)
    const newMessagemargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight =$newMessage.offsetHeight + newMessagemargin //single message height
    
    //visible Height (amount of space containing the messages (doesnt change))
    const visibleHeight= $messages.offsetHeight 

    //Height of messages container (all height of messages even what you're not seeing)
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text, //set dynamic variable message in index.html to message we have here in callback 
        createdAt:moment(message.createdAt).format('h:mm a') //or moment().format('h:mm a') --> accordomg to docs
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html= Mustache.render(locationMessageTemplate,{
        username: message.username,
        url:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    // console.log(room)
    // console.log(users)
    const html=Mustache.render(sidebarTemplate,{
        room:room,
        users:users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault() //prevents refresh when submitting

    $messageFormButton.setAttribute('disabled', 'disabled') //disables form button 
    var message = e.target.elements.message.value // e.target is our form in the html file
    
    socket.emit("sendMessage", message, (response)=>{
        //inside callback(aknowledgment) resonse, we can re-enable form button again since message was delivered
        $messageFormButton.removeAttribute('disabled') //This helps to prevent user of accidently double clicking when sending message 
        $messageFormInput.value='' //clears input field after receiving aknowled
        $messageFormInput.focus() //By5aly elfocus lesa mawgood after receiving aknowled
        if(response.error !== undefined)
            return console.log(response.error)
        console.log('Message Delivered Successfully')
    })
})


$LocationButton.addEventListener('click', ()=>{
    
    if(!navigator.geolocation)// if mdn geolocation is not supported by browser
        return alert('Geolocation is not supported by browser')

    $LocationButton.setAttribute('disabled','disabled') //disable location send button before disabling button 
    
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position.coords)
        const Currposition={}
        Currposition.long=position.coords.longitude
        Currposition.lat=position.coords.latitude
        console.log(Currposition)

        //send to server
        socket.emit('sendLocation',Currposition,(response)=>{
            console.log(response)
            $LocationButton.removeAttribute('disabled') //re-enable location button after receiving aknowledgment
        })
    })

   
})

socket.emit('Join', {username,room},(error)=>{ //emits once connection is established(redirecting from join page to chat page)
    if(error) //this is in the callback function
    {   
        alert(error)
        location.href='/' //sends back to the root of the site (join page)
        
    }
})

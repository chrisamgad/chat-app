const express = require('express')
const socketio=require('socket.io')
const app = express()
const http=require('http')
const path = require('path')
const Filter= require('bad-words')
const {generatedMessage}=require('./utils/messages')
const {addUser,removeUser,getUser, getUsersInRoom} = require('../src/utils/users')

const server=http.createServer(app) //express already does this behind the scenes but we write it because 
                            //we need to do some refacotring in order to make node use express and websockets at the same time
                            //then we can pass it in the socketio function as done below
                            //if we didnt do this , we wont have access to the server variable
const io=socketio(server) //create a new socket instance and pass server to it

const port = process.env.PORT || 3000 
const publicDirectoryPath=path.join(__dirname,'../public')
console.log(__dirname)
app.use(express.static(publicDirectoryPath))//

//let count =0

//io.on('connection) is when a user connects
io.on('connection',(socket)=>{ //1st arg is an event and 2nd arg is a function that gets triggered when this event occurs
    console.log('New WebSocet connection')   
    
    //socket.emit("message", generatedMessage('Welcome'))
    //socket.broadcast.emit('message', "A new user has joined") //broadcast.emit sends to all users except myself
                                                                //for example, we want all users to print "A new user has joined" when I join room
    
    socket.on('Join',({username,room}, callback)=>{ //callback is for the aknowledgment in case there is error
      
      const {error,user}= addUser({
        id: socket.id, //socket.id is a unique id and is a property in socket
        username: username,
        room:room
      });

      if(error)
        return callback(error) //aknowledge back to client the error
      
      socket.join(user.room) //allows us to join a specific chat room and we pass to it the string name of the room
                        //Only people in the same room would be able to see each other and messages of each other
      socket.emit("message", generatedMessage(user.username, 'Welcome'))
      
      socket.broadcast.to(user.room).emit('message', generatedMessage(user.username,`${user.username} has joined the room!`)) //broadcast.emit sends to all users except myself
                                                                //for example, we want all users to print "A new user has joined" when I join room
      
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
      
      
      callback() //no arguements means there is no error so aknowledgment sent that there is no errors
    })
    
    socket.on("sendMessage", (message,callback)=>{
      const filter= new Filter() //instance of bad-words library
      if(filter.isProfane(message)) //lw kelma el eluser ba3atha fiha bad-word ex: asshole
        return callback({error:'Profanity is not allowed!'})//Dont execute the next code (bec of return) aknowledge back to user that bad words are not allowed
      
      const user=getUser(socket.id)
      io.to(user.room).emit("message",generatedMessage(user.username, message))
      
      callback({error: undefined}); //No error
    })

    socket.on('sendLocation',(CurrentLocation,callback)=>{//callback is aknowledgment
      callback("Location shared!")
      //console.log(CurrentLocation)
      
      const user=getUser(socket.id)
      io.to(user.room).emit('locationMessage',generatedMessage(user.username, `https://google.com/maps?q=${CurrentLocation.long},${CurrentLocation.lat}`)) //emits to all users google maps location
    })

    socket.on('disconnect',()=>{ //when a client disconnects
      const user=removeUser(socket.id)
      if(user) //if there was actually a user, otherwise we don't need to show this message
        {
          io.to(user.room).emit('message', generatedMessage(user.username, `${user.username} has left`))
          //console.log(user)
          io.to(user.room).emit('roomData',{ //send last updated room data to update users shown in room
            room:user.room,
            users:getUsersInRoom(user.room)
          })
      }
    })

})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
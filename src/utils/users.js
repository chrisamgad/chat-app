const users=[]

const addUser =({id,username,room})=>{
    
    //Clean the data
    username= username.trim().toLowerCase() //trim removes spaces after&before username and toLowerCase makes all letters lower case
    room=room.trim().toLowerCase()

    //Validate the data 
    if(!username || !room) //if no username or room is found
        return {
            error: 'Username and room are required!'
        }

    //Check for existing user
    const existingUser = users.find((user)=>{//iterate on each user in the array to see if meets requirement       
        return user.room === room && user.username===username //if this condition is met, return back to existingUser
    })

    //Validate username
    if(existingUser)
        return{
            error:'Username is already in use'
        }
    
    //By reaching this point, each requirement is correctly met
    //Store user
    const user={id,username,room}
    users.push(user)
    //console.log(users)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id===id //if user.id equals id passed in parameter
    })

    if(index!==-1) //this mean we found a match
        {  
            return (users.splice(index,1))[0]//splice is a javascript function that allows us to remvoe an item from an array by index number
        }                            //1st arg is index we want to delete the item from and 2nd arg is number of items we want to delete
}

const getUser =(id)=>{
   return users.find((user)=>{
       return user.id ===id
   })
}

const getUsersInRoom =(room)=>{
    let UsersInRoom =[]
    room=room.trim().toLowerCase()
    UsersInRoom= users.filter((user)=>{
        return user.room===room
    })
    //console.log(UsersInRoom)
    return UsersInRoom

}

//Testing

// const response = addUser({
//     id:22,
//     username:'chris',
//     room:'1'
// })

// console.log(response)

//const removedUser=removeUser(22)
//console.log(removedUser)

//console.log(getUser(123))

//console.log(getUsersInRoom('Room 1'))


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
const generatedMessage =(username, text)=>{
    return{
        username,
        text,
        createdAt: new Date().getTime()
    }
}

module.exports ={
    generatedMessage
}
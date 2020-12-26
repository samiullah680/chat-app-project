  
const express = require('express');
const app = express();
const routes = require('./controllers/routes');
const path = require('path');
const http = require('http').createServer(app)



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// set public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'))

app.use('/css', express.static(__dirname + 'public/css'))
app.use('/css', express.static(__dirname + 'public/img'))



// Socket 
const io = require('socket.io')(http)

io.on('connection', (socket) => {
    console.log('Connected...')
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg)
    })

})




app.get('/', routes);

app.get('/register', routes);
app.post('/register', routes);
app.get('/login', routes);
app.post('/login', routes);
app.get('/success', routes);
app.get('/logout', routes);
app.post('/addmsg', routes);
app.get('/chat', routes);
app.get('/chatconnect', routes);
app.post('/chatconnect', routes);

const PORT = process.env.PORT || 8000;
//app.listen(PORT, () => console.log("Server Stated At Port", PORT));
http.listen(PORT, () =>{
    console.log("Server Stated At Port", PORT)
})
// サーバ側の処理

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4 : uuidV4 } = require('uuid')

const {ExpressPeerServer} = require('peer')
const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.use('/peerjs', peerServer)

app.set('view engine', 'ejs')
app.use(express.static('public')) //publicフォルダ内のファイルを読み込めるようにする

app.get('/', (req, res) => {
    res.redirect((`/${uuidV4()}`))
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

/*connection(webSocket確立時)イベント時
クライアントが接続するたびにイベントハンドラを登録*/
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)  // roomIdルームに接続
        // 特定クライアントに送信
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('desconnect', () => {
            socket.to(roomId).broadcast.emit('user-desconnected', userId)
        })
    })
})


server.listen(process.env.PORT || 3000);
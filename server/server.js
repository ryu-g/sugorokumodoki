const io = require('socket.io')()
const map = [
  "風船が飛んでいます",
  "猫が１匹歩いていきました",
  "猫が２匹歩いていきました",
  "猫が３匹歩いていきました",
  "猫が１匹寝ています",
  "猫が２匹寝ています",
  "猫が３匹喧嘩しています",
  "猫になってしまった",
  "起床しました。それではスタートしましょう。",
  "changeEvent",
  "足が折れた。1マスもどる",
  "腕が折れた。1マスもどる",
  "マンホールがあります",
  "いい天気です",
  "雨が降ってきました",
  "雪だるまがあります",
  "地蔵が歩いています",
  "お腹が痛い",
  "おお勇者よ、死んでしまうとは情けない",
  "サイコロが増えたきがする　今なら強いぞ",
  "トランポリンがある ",
  "なすをもらった",
  "眠くなってきた",
  "食パン２枚の間にチーズとハムを沢山挟んでじっくり焼くと、炭になる。",
  "パン粉を食べ過ぎた",
  "太宰治の身長は175cmです"
]
const port = 3000
const connectPlayers = new Map()
const namako = new Map()
let game_playing = false
let numOfPlayers

let top = 0
const goal = 22
let turn = 1
let actionCount = 1

let userList = ""
let AllUserList = []
const black   = '\u001b[30m'
const red     = '\u001b[31m'
const green   = '\u001b[32m'
const yellow  = '\u001b[33m'
const blue    = '\u001b[34m'
const magenta = '\u001b[35m'
const cyan    = '\u001b[36m'
const white   = '\u001b[37m'
const reset   = '\u001b[0m'

const local = `${green}[LOCAL]${reset}`
const system = `${yellow}[SYSTEM]${reset}`
const gameMaster = `${green}[† GM †]${reset}`
console.log(namako)

io.listen(port)
console.log(`open in ${port}`)

io.on('connection', (socket) => {
  for(key of connectPlayers.keys()){
    connectPlayers.get(key).entry = false

  }
  numOfPlayers = connectPlayers.size+1

  socket.emit('name hosii')
  socket.on('name dozo', (user)=>{
    data = `${user}さんが入室しました。`
    socket.broadcast.emit('message',data)
    connectPlayers.set(socket.id ,new PlayerData(user, socket.id))

    // console.log(connectPlayers.get(socket.id))
    console.log(`[server] connected name is ${yellow}${user}${reset}, id is ${yellow}${socket.id}${reset},`);

    userList = ""
    AllUserList = []
    let i = 0
    for(let key of connectPlayers.keys()){
      AllUserList[i] = connectPlayers.get(key).name
      if(key != socket.id){
        let other = connectPlayers.get(key).name
        userList = `${other + userList}`
      }
      i++
    }
    socket.emit('list dozo', userList)
  })

  socket.on('dice', ()=>{
    name = connectPlayers.get(socket.id).name
    const d = connectPlayers.get(socket.id).diceThrough()
    message = `${gameMaster} ${name}さんがサイコロを振ります。${d}が出ました`
    io.sockets.emit('sugoroku', message)
    connectPlayers.get(socket.id).movePosition(d)
    message = connectPlayers.get(socket.id).displayStatus()
    io.sockets.emit('sugoroku', message)

    const pos = connectPlayers.get(socket.id).position
    if( pos > top ){
      top = pos
      message = `${gameMaster} 現在のトップは${name}さんです`
      // io.sockets.emit('sugoroku', message)
    }
    sugoroku(socket, turn, numOfPlayers, goal, top, actionCount)
  })

  //通常メッセージ
  socket.on('message', (user, message) => {
    /*
    console.log(`\n${system}`);
    console.log(`AllUserList : ${AllUserList}`);
    console.log(`game_playing : ${game_playing}`);
    console.log(`numOfPlayers : ${numOfPlayers}`);

    console.log(`actionCount : ${actionCount}`)
    console.log(`numOfPlayers : ${numOfPlayers}`)
    console.log(`actionCount / numOfPlayers : ${Math.round(actionCount % numOfPlayers)}`);
    */
    // socket.emit('message', `${system} : ${pickUser} san`)

    if(message ==``){
      return
    }
    switch(message){
      case "1" :
        console.log(`data is 1`);
        if(game_playing){
          socket.emit('throwDice')
          // socket.broadcast.emit('throwDice')
          // sugoroku(socket, turn, numOfPlayers, goal, top, actionCount)
        }
        break

      case "2" :
        console.log(`data is ${message}`)
        break
      case "3" :
        console.log(`data is ${message}`)
        break
      case "entry" :
        connectPlayers.get(socket.id).entry = true
        let playerCount = 0;

        for(let key of connectPlayers.keys()){
          if(connectPlayers.get(key).entry == true ){
            playerCount++
          }
        }
        if (playerCount == connectPlayers.size){
          data = `\n${system} ${cyan}${user}${reset}さんがすごろくにエントリーしました。\n${system} 全員がすごろくにエントリーしました。始まります。`
          io.sockets.emit('message', data)
          // io.sockets.emit('join', "やる？")
          game_playing = true
          sugorokuInit(socket, turn, numOfPlayers, goal, top, actionCount)
          return
        }else{
          data  = `${system} ${user}さんがすごろくにエントリーしました。\n${system} 全員のエントリーで始まります。`
          io.sockets.emit('message', data)
          break
        }

      default :
        data = `${user} : ${message} `
        console.log(data)
        socket.broadcast.emit('message', data)
    }
    // console.dir(connectPlayers)
  })

  socket.on('disconnect', () => {
    console.log(`[server] disconnected, id: ${socket.id}`);
    data = `${connectPlayers.get(socket.id).name}さんが退室しました`
    socket.broadcast.emit('message',data )
    if(game_playing){
      game_playing = false
      socket.broadcast.emit('message',`${gameMaster} ${connectPlayers.get(socket.id).name}さんが退室したので、すごろくを終了します。` )
    }
    connectPlayers.delete(socket.id)
    console.log(`[server] deleted Player id : ${socket.id}`);
    console.log(connectPlayers);
  })
})


function sugorokuInit(socket, playturn, numOfPlayers, goalScore, topScore, count){
  data = `${gameMaster} はい、それではすごろくを始めます`
  io.sockets.emit('sugoroku', data)
  list = `${gameMaster} ${cyan}参加者 : ${AllUserList} ${reset}`
  io.sockets.emit('sugoroku', list)

  io.sockets.emit('sugoroku', `${gameMaster} ゴールは${cyan}${goalScore}${reset}です。`)
  sugoroku(socket, playturn, numOfPlayers, goalScore, topScore, count)
}

function sugoroku(socket, playturn, numOfPlayers, goalScore, topScore, count){
  console.log(`roller socket-id : ${socket.id}`)
  console.log(`playturn : ${playturn}`)
  console.log(`goalScore : ${goalScore}`)
  console.log(`topScore : ${topScore}`)
  console.log(`rolled : ${count}`)

  let turn = Math.round(count/numOfPlayers)
  console.log(`★turn : ${turn}`)
  const pickUserNum = Math.round(actionCount % numOfPlayers)
  const pickUser = AllUserList[pickUserNum]
  console.log(`pickUser : ${pickUser}`);

  const name = pickUser

  actionCount = count + 1
  if(top <= goalScore ){
    io.sockets.emit('sugoroku', `${gameMaster} ${turn}ターン目`)
    message = `${gameMaster} ${cyan}${name}${reset}さんの番です `
    io.sockets.emit('sugoroku', message)
    message = `${gameMaster} どうする？ [1]サイコロを振る [2]現在位置を見る `
    io.sockets.emit('sugoroku', message)
    turn+=1
  }else{
    message = `${gameMaster} ${pickUser}さんが先にゴールしました！すごろくを終了します。`
    io.sockets.emit('sugoroku', message )
    game_playing = false
    message = `もう一度遊ぶ場合は${cyan}entry${reset}と入力してください`
    io.sockets.emit('reflesh', message )
    console.log(message);
    for(key of connectPlayers.keys()){
      connectPlayers.get(key).entry = false
    }
  }
}

function PlayerData(name, id){
  this.name = name
  this.id = id
  this.diceID = 6
  this.position = 1
  this.entry = false
  // console.log(`[server] generate user ${this.name}, ID is ${this.id}`);

  this.diceThrough = () => {
    return Math.floor(Math.random()*100)%this.diceID+1
    //1からdiceIDまでの数字が出る
  }
  this.displayStatus = () => {
    message = `${gameMaster} ${cyan}${this.name}${reset}さんの現在位置は${this.position}です。\n`
    return message
  }
  this.movePosition = (d) =>{
    this.position += d
  }
}



const readline = require('readline')
const accessurl = `http://localhost:3000`
const socket = require('socket.io-client')(accessurl)
const user = process.argv[2]
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

const whiteMessage = ( message ) =>{
  return `${white}${message}${reset}`
}

console.log(`${local} connecting to ${accessurl}...`)
rl = readline.createInterface(process.stdin, process.stdout)
rl.setPrompt('')

rl.on('line', (line) => {
  socket.emit('message', user, line)
})
  .on('close', () => {
    process.exit(0)
  })

socket.on('name hosii', () =>{
  socket.emit('name dozo', user)
})

socket.on('list dozo', (data) =>  {
  if(data!="")console.log(`${local} この部屋にはあなたの他に ${data} がいます。`)
})

socket.on('connect', () => {
  console.log('- - - - - - - - - - -');
  console.log(`${local} ようこそ ${user} さん`)
  console.log(`${local} ${cyan}entry${reset}と入力するとすごろくにエントリーできます。`)
})

socket.on('reflesh', (data)=>{
  console.log(`${local} ${data}`);
})

socket.on('message', (data) => {
  console.log(whiteMessage(data))
})

socket.on('sugoroku', (data) => {
  console.log(data)
})

socket.on('join', (data) => {
  console.log(data)
  socket.emit('startGame', user)
})

socket.on('error', (err) => {
  console.log('[SYSTEM] Error:', err)
})

socket.on('throwDice', ()=>{
  socket.emit('dice', user)
})

socket.on('disconnect', () => {
  console.log(`\n${system} サーバーとの接続が解除されました.\n${system} 画面をこのままにしておくと再接続出来る場合があります...\n`)
})
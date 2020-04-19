const readlineSync = require('readline-sync')

//PlayerData
function PlayerData(name){
    this.name = name
    this.diceID = 6
    this.position = 1
    this.greet = () =>{
        // console.log(`generate user [${this.name}], diceID is ${this.diceID}`);
    }
    this.diceThrough = () => {
        return Math.floor(Math.random()*100)%this.diceID+1
        //1からdiceIDまでの数字が出る
    }
    this.displayStatus = (count) => {
        if(count%2 ==0 ) {side = "■ "} else side="□ "
        console.log(`${side} ${this.name}さんの現在位置は${this.position}です。`)
    }
}

let players = ["きりか","しらべ"]
let unit =[]

for (id in players){
    unit[id] = new PlayerData(players[id])
    unit[id].greet()
}

//MapData
let now_at = 1
let count = 1
let side = "■"
let top = 0
const goal = 14

//view
console.log('[SYSTEM]はい、それではすごろくがはじまります。\n')

while (top <= goal) {
    console.log(count % 2.0 );
    if(count % 2 === 0 ) {side = "■ "} else {side="□ "}
    console.log(`${count}ターン目です`)
    for(player in unit){
        unit[player].displayStatus()
        let d = unit[player].diceThrough()
        console.log(`${side} ${unit[player].name}さんの番です。どうする？ [1]サイコロを振る [2]現在位置を見る `);
        const action = readlineSync.question(`>>`)
        switch(action){
            case "1" :
                console.log(`${side} サイコロを振ります。${d}が出ました`);
            break
            case "2" :
                unit[player].displayStatus()
            break
        }
        unit[player].position += d
        
        if(top < unit[player].position ) top = unit[player].position
        if(top > goal){
          console.log(`${side} ${unit[player].name} さんが先にゴールしました!`)
          break  
        }else{
            const end = readlineSync.question(`${side} ${unit[player].name}さんの番を終わります。 `)
        }
        console.log(`\n`)
    }
    count++
}

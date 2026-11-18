const gameManager = {
    factory: {},
    entities: [],
    player: null,
    laterKill:[],
    tasksDone: 0,
    tasksTotal: 0,
    score: 0,
    timer: null, // id игрового цикла (setInterval)
    over: false,
    levels: [
        { map: 'assets/maps/level1.json', visitorSpeed: 1, seeRange: 80, drain: 0.05 },
        { map: 'assets/maps/level2.json', visitorSpeed: 1, seeRange: 96, drain: 0.08 }
    ],
    level: 0,
    paused: false,
    initPlayer: function (obj) {
        this.player = obj;
    },
    kill: function (obj) {
        this.laterKill.push(obj);
    },
    loadLevel: function(n){
        this.level = n;
        this.entities = [];
        this.laterKill = [];
        this.player = null;
        this.tasksDone = 0;
        this.tasksTotal = 0;
        this.paused = false;
        mapManager.loadMap(this.levels[n].map);
        mapManager.parseEntities();
    },
    // Тень коснулась игрока
    playerCaught: function (visitor) {
        if (this.over) return;
        if (this.player.shield) {
            // омамори спасает один раз: Тень возвращается на место появления
            this.player.shield = false;
            visitor.pos_x = visitor.spawn_x;
            visitor.pos_y = visitor.spawn_y;
            visitor.fsm.current = 'wander';
        } else {
            this.gameOver();
        }
    },
    gameOver: function () {
        soundManager.stopAll();
        soundManager.play('assets/sounds/jumpscare.mp3',{volume: 5} );
        const scare = document.getElementById('scare');
        const img = document.getElementById('scare-img');
        scare.classList.add('show');
        let f = 0;
        setInterval(() => {
            f = 1 - f;
            img.src = `./assets/sprites/scare_${f}.png`;
        }, 90);
        this.over = true;
        clearInterval(this.timer);
        document.getElementById('goal').textContent = 'Вас нашли...';
        document.getElementById('hud-msg').textContent = 'Смена не окончена';
        this.finishGame('пойман');
    },
    gameWin: function (){
        soundManager.stopAll();
        this.over = true;
        clearInterval(this.timer);
        document.getElementById('goal').textContent = 'Вы пережили эту ночь';
        this.finishGame('выжил');
    },
    levelComplete: function () {
        if(this.paused) return;
        this.paused = true;
        this.score+=500;
        if ( this.level < this.levels.length -1 ){
            document.getElementById('goal').textContent = 'Смена в зале окончена. Вас ждут на складе...';
            setTimeout(()=>this.loadLevel(this.level+1),2000);
        }else{
            this.gameWin();
        }
    },
    finishGame: function (result) {
        records.add({
            name: playerName,
            score: this.score,
            level: this.level + 1,
            result: result,
            date: new Date().toLocaleString('ru-RU')
        });
        setTimeout(() => { location.href = 'records.html'; }, 3000);
    },
    update: function () {
        if (this.player === null || this.over || this.paused) {
            return;
        }

        if(this.tasksTotal === 0){
            this.tasksTotal = this.entities.filter(e => e.name.startsWith('shelf')).length;

            const cfg = this.levels[this.level];
            this.entities.forEach(e =>{ if(e.name.startsWith('visitor')){
                e.speed = cfg.visitorSpeed;
                e.seeRange = cfg.seeRange;
            }});
        }

        this.player.move_x = 0;
        this.player.move_y = 0;

        if (eventsManager.action["up"]) this.player.move_y = -1;
        if (eventsManager.action["down"]) this.player.move_y = 1;
        if (eventsManager.action["left"])  this.player.move_x = -1;
        if (eventsManager.action["right"]) this.player.move_x = 1;

        this.entities.forEach(function (e) {
            try { e.update(); } catch (ex) { console.log(ex); }
        });
        for (let i = 0; i < this.laterKill.length; i++){
            let idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1) {
                this.entities.splice(idx, 1);
            }
        }
        if (this.laterKill.length > 0) {
            this.laterKill.length = 0;
        }
        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        mapManager.draw(ctx);
        this.draw(ctx);
        lighting.draw(ctx);
        this.entities.forEach(e => { if (e.drawEyes) e.drawEyes(ctx); });

        document.getElementById('hud-level').textContent = this.level + 1;
        document.getElementById('hud-tasks').textContent = this.tasksDone + '/' + this.tasksTotal;
        document.getElementById('hud-battery').textContent = Math.round(this.player.battery);
        document.getElementById('hud-score').textContent = this.score;

        const goal = document.getElementById('goal');
        if (this.over || this.paused) {
            // надпись уже выставлен
        } else if (this.tasksDone < this.tasksTotal) {
            goal.textContent = `Разложите товар по полкам (${this.tasksDone}/${this.tasksTotal})`;
        } else {
            goal.textContent = 'Все задачи выполнены -- подойдите к кассе, чтобы закрыть смену';
        }

        document.getElementById('buff-coffee').classList.toggle('active', this.player.speed > 2);
        document.getElementById('buff-omamori').classList.toggle('active', this.player.shield);
        document.getElementById('buff-battery').classList.toggle('active', this.player.battery > 0);
    },
    loadAll: function () {
        spriteManager.loadAtlas('assets/sprites/atlas.json', 'assets/sprites/atlas.png');
        gameManager.factory['Player'] = Player;
        gameManager.factory['Visitor'] = Visitor;
        gameManager.factory['Box'] = Box;
        gameManager.factory['Shelf'] = Shelf;
        gameManager.factory['Exit'] = Exit;
        gameManager.factory['Battery'] = Battery;
        gameManager.factory['Coffee'] = Coffee;
        gameManager.factory['Omamori'] = Omamori;
        lighting.init(canvas.width, canvas.height);
        eventsManager.setup(canvas);
        soundManager.init();
        soundManager.loadArray([
            'assets/sounds/ambient.mp3',
            'assets/sounds/step.mp3',
            'assets/sounds/pickup.mp3',
            'assets/sounds/bonus.mp3',
            'assets/sounds/heartbeat.mp3',
            'assets/sounds/jumpscare.mp3'
        ]);
        soundManager.play('assets/sounds/ambient.mp3', { looping: true, volume: 0.4 });
        this.loadLevel(0);
    },
    draw: function (ctx) {
        for (let e = 0; e < this.entities.length; e++) {
            this.entities[e].draw(ctx);
        }
    },
    play: function () {
        this.timer = setInterval(updateWorld, 40);
    },
};
function updateWorld() {
    gameManager.update();
}

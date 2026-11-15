const gameManager = {
    factory: {},
    entities: [],
    player: null,
    laterKill:[],
    tasksDone: 0,
    tasksTotal: 0,
    score: 0,
    timer: null,         // id игрового цикла (setInterval)
    over: false,         // игра окончена
    initPlayer: function (obj) {
        this.player = obj;
    },
    kill: function (obj) {
        this.laterKill.push(obj);
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
        this.over = true;
        clearInterval(this.timer);
        document.getElementById('goal').textContent = 'Вас нашли...';
        document.getElementById('hud-msg').textContent = 'Смена не окончена';
    },
    levelComplete: function () {
        document.getElementById('hud-msg').textContent = 'Смена окончена!';
    },
    update: function () {
        if (this.player === null || this.over) {
            return;
        }

        if(this.tasksTotal === 0){
            this.tasksTotal = this.entities.filter(e => e.name.startsWith('shelf')).length;
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
        // глаза Тени светятся поверх темноты
        this.entities.forEach(e => { if (e.drawEyes) e.drawEyes(ctx); });

        document.getElementById('hud-tasks').textContent = this.tasksDone + '/' + this.tasksTotal;
        document.getElementById('hud-battery').textContent = Math.round(this.player.battery);
        document.getElementById('hud-score').textContent = this.score;

        const goal = document.getElementById('goal');
        if (this.over) {
            // надпись «Вас нашли...» уже выставлена в gameOver
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
        mapManager.loadMap('assets/maps/level1.json');
        spriteManager.loadAtlas('assets/sprites/atlas.json', 'assets/sprites/atlas.png');
        gameManager.factory['Player'] = Player;
        gameManager.factory['Visitor'] = Visitor;
        gameManager.factory['Box'] = Box;
        gameManager.factory['Shelf'] = Shelf;
        gameManager.factory['Exit'] = Exit;
        gameManager.factory['Battery'] = Battery;
        gameManager.factory['Coffee'] = Coffee;
        gameManager.factory['Omamori'] = Omamori;
        mapManager.parseEntities();
        lighting.init(canvas.width, canvas.height);
        mapManager.draw(ctx);
        eventsManager.setup(canvas);
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

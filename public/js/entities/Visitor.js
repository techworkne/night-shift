class Visitor extends Entity {
    constructor() {
        super();
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 1;
        this.frame = 0;  // счётчик кадров анимации
        this.timer = 0;  // сколько кадров идёт в текущем направлении (для wander)
        this.seeRange = 80;  // с какого расстояния замечает игрока (5 клеток)
        this.spawn_x = null;  // точка появления (сюда возвращается после омамори)
        this.spawn_y = null;
        this.detour = 0;  // сколько кадров ещё идти в обход препятствия
        this.side = 1;  // в какую сторону обходить (+1 или -1)
        this.stuck = 0;  // сколько раз подряд упёрлись в одно препятствие
        this.prefer = null;  // ось, по которой упёрлись. после обхода сначала пробуем её


        this.fsm = {
            current: 'wander',
            states: ['wander', 'chase', 'frozen'],
            transitions: [
                { event: 'see',  from: 'wander', to: 'chase'  },
                { event: 'lost', from: 'chase',  to: 'wander' },
                { event: 'lit',  from: 'wander', to: 'frozen' },
                { event: 'lit',  from: 'chase',  to: 'frozen' },
                { event: 'dark', from: 'frozen', to: 'chase'  }
            ],
            update: function (event) {
                for (let t of this.transitions) {
                    if (t.event === event && t.from === this.current) {
                        this.current = t.to;
                        return true;
                    }
                }
                return false;
            }
        };
    }

    update() {
        const player = gameManager.player;
        this.frame++;
        if (this.frame % 40 === 0) {
            soundManager.playWorldSound('assets/sounds/heartbeat.mp3', this.pos_x, this.pos_y);
        }

        // на первом кадре: столкновения считаем только по «ногам» (нижняя клетка 16×16),
        // голова рисуется выше — иначе Тень задевает игрока сквозь стеллаж и не пролезает в проходы
        if (this.spawn_x === null) {
            this.pos_y += this.size_y - 16;
            this.size_y = 16;
            this.spawn_x = this.pos_x;
            this.spawn_y = this.pos_y;
        }

        const dx = (player.pos_x + player.size_x / 2) - (this.pos_x + this.size_x / 2);
        const dy = (player.pos_y + player.size_y / 2) - (this.pos_y + this.size_y / 2);
        const dist = Math.hypot(dx, dy);

        let event;
        if (lighting.isInLight(this)) {
            event = 'lit';
        } else if (this.fsm.current === 'frozen') {
            event = 'dark';
        } else if (dist < this.seeRange) {
            event = 'see';
        } else {
            event = 'lost';
        }
        this.fsm.update(event);

        //действие в зависимости от состояния
        if (this.fsm.current === 'frozen') {
            this.move_x = 0;
            this.move_y = 0;
            return;
        }
        const detouring = this.detour > 0;
        if (this.fsm.current === 'chase') {
            if (this.detour > 0) {
                this.detour--;
            } else {
                this.chase(dx, dy);
            }
        } else {
            this.wander();
        }


        const result = physicManager.update(this);
        if (result === 'move' && !detouring) {
            this.stuck = 0;
            this.prefer = null;
        }
        if (result === 'break') {
            if (this.fsm.current !== 'chase') {
                this.randomDir();
            } else if (detouring) {
                // упёрлись идя вбок. дальше обходим с другой стороны
                this.side = -this.side;
                this.detour = 0;
            } else {
                this.goAround(dx, dy);
            }
        }
    }

    goAround(dx, dy) {
        // сторону обхода выбираем один раз на препятствие (в сторону игрока),
        const first = this.stuck === 0;
        this.stuck++;
        this.prefer = this.move_x !== 0 ? 'x' : 'y';  // по какой оси упёрлись
        if (this.stuck > 14) {
            // никак не обойти. отходим в случайную сторону и пробуем снова
            this.randomDir();
            this.detour = 48;
            this.stuck = 0;
            return;
        }
        if (this.move_x !== 0) {
            // шли по горизонтали. обходим по вертикали
            if (first && Math.abs(dy) > 2) this.side = Math.sign(dy);
            this.move_x = 0;
            this.move_y = this.side;
        } else {
            if (first && Math.abs(dx) > 2) this.side = Math.sign(dx);
            this.move_y = 0;
            this.move_x = this.side;
        }
        if (physicManager.update(this) === 'break') {
            this.side = -this.side;  // тупик. в следующий раз в другую сторону
            this.detour = 0;
        } else {
            this.detour = 16;
        }
    }

    chase(dx, dy) {
        this.move_x = 0;
        this.move_y = 0;
        let axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        // если недавно упёрлись сначала пробуем пройти по той же оси (обходим препятствие до конца)
        if (this.prefer === 'x' && Math.abs(dx) > 2) axis = 'x';
        if (this.prefer === 'y' && Math.abs(dy) > 2) axis = 'y';
        if (axis === 'x') {
            this.move_x = Math.sign(dx);
        } else {
            this.move_y = Math.sign(dy);
        }
    }


    wander() {
        this.timer++;
        if (this.timer >= 50 || (this.move_x === 0 && this.move_y === 0)) {
            this.randomDir();
        }
    }

    randomDir() {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        this.move_x = d[0];
        this.move_y = d[1];
        this.timer = 0;
    }


    onTouchEntity(obj) {
        if (obj === gameManager.player) {
            gameManager.playerCaught(this);
        }
    }



    draw(ctx) {
        let name;
        if (this.fsm.current === 'frozen') {
            name = `visitor_frozen_${Math.floor(this.frame / 8) % 2}`;
        } else if (this.fsm.current === 'chase') {
            name = `visitor_chase_${Math.floor(this.frame / 6) % 4}`;
        } else {
            const side = this.move_y < 0 ? 'up' : 'down';
            name = `visitor_walk_${side}_${Math.floor(this.frame / 6) % 4}`;
        }
        spriteManager.drawSprite(ctx, name, this.pos_x, this.pos_y - 16);
    }


    drawEyes(ctx) {
        if (this.fsm.current === 'frozen' || this.move_y < 0) return;
        const sx = this.pos_x - mapManager.view.x;
        const sy = this.pos_y - 16 - mapManager.view.y;
        if (this.fsm.current === 'chase') {

            const n = Math.floor(this.frame / 6) % 4;
            const shift = n === 1 ? 1 : (n === 3 ? -1 : 0);
            ctx.fillStyle = '#dc1923';
            ctx.fillRect(sx + 6 + shift, sy + 4, 1, 2);
            ctx.fillRect(sx + 9 + shift, sy + 4, 1, 2);
        } else {
            ctx.fillStyle = '#f0eee6';
            ctx.fillRect(sx + 6, sy + 5, 1, 1);
            ctx.fillRect(sx + 9, sy + 5, 1, 1);
        }
    }
}

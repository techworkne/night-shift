class Player extends Entity {
    constructor() {
        super();
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 2;
        this.battery = 100;
        this.shield = false;
        this.carrying = false;
        this.dir = 'down';
        this.frame = 0;
    }
    draw(ctx) {
        const steps = [0, 1, 0, 2];
        const n = steps[Math.floor(this.frame / 4) % 4];
        spriteManager.drawSprite(ctx, `player_${this.dir}_${n}`, this.pos_x, this.pos_y);
        if (this.carrying) {
            spriteManager.drawSprite(ctx, 'box', this.pos_x, this.pos_y - 10);
        }
    }
    update() {
        physicManager.update(this);
        if (this.move_y === -1) this.dir = 'up';
        if (this.move_y === 1) this.dir = 'down';
        if (this.move_x === -1) this.dir = 'left';
        if (this.move_x === 1) this.dir = 'right';
        if (this.move_x !== 0 || this.move_y !== 0) {
            this.frame++;
        } else {
            this.frame = 0;
        }
        if (this.battery > 0) {
            this.battery = Math.max(0, this.battery - gameManager.levels[gameManager.level].drain);
        }
    }
    onTouchEntity(obj){
        if(obj){
            if(obj.name.startsWith('box') && !this.carrying){
                this.carrying = true;
                gameManager.kill(obj);
            }
            if(obj.name.startsWith('shelf') && this.carrying && !obj.filled){
                this.carrying = false;
                obj.filled = true;
                gameManager.tasksDone++;
                gameManager.score += 100;
            }
            if(obj.name.startsWith('battery')) {
                this.battery += 50;
                if (this.battery > 100){
                    this.battery = 100;
                }
                gameManager.kill(obj)
            }
            if(obj.name.startsWith('coffee')) {
                this.speed = 3;
                gameManager.kill(obj)
                setTimeout(() => {this.speed = 2;}, 5000)
            }
            if(obj.name.startsWith('omamori')) {
                if (!this.shield){
                    this.shield = true;
                    gameManager.kill(obj)
                }
            }
            if(obj.name.startsWith('visitor')) {
                gameManager.playerCaught(obj);
            }
            if(obj.name.startsWith('exit')) {
                if (gameManager.tasksTotal === gameManager.tasksDone){
                    gameManager.levelComplete();
                }
            }
        }
    }
}

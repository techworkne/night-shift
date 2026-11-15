class Exit extends Entity {
    constructor() {
        super();
        this.register_on = false;
    }
    draw(ctx) {
        const name = gameManager.tasksDone === gameManager.tasksTotal ? 'register_on' : 'register_off';
        spriteManager.drawSprite(ctx, name, this.pos_x, this.pos_y);
    }
}

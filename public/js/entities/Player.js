class Player extends Entity {
    constructor() {
        super();
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 2;
    }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'player_down_0', this.pos_x, this.pos_y);
    }
    update() { physicManager.update(this); }
}
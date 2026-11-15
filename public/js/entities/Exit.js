class Exit extends Entity {
    constructor() { super(); }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'register_off', this.pos_x, this.pos_y);
    }
}
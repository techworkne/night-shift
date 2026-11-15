class Coffee extends Entity {
    constructor() { super(); }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'coffee', this.pos_x, this.pos_y);
    }
}
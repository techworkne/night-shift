class Omamori extends Entity {
    constructor() { super(); }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'omamori', this.pos_x, this.pos_y);
    }
}
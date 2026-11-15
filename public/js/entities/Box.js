class Box extends Entity {
    constructor() { super(); }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'box', this.pos_x, this.pos_y);
    }
}
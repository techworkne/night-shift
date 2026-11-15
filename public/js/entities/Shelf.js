class Shelf extends Entity {
    constructor() { super(); }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'shelf_empty', this.pos_x, this.pos_y);
    }
}
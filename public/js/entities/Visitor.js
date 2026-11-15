class Visitor extends Entity {
    constructor() { super(); }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'visitor_walk_down_0', this.pos_x, this.pos_y);
    }
}
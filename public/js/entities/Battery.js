class Battery extends Entity {
    constructor() { super(); }
    draw(ctx) {
        spriteManager.drawSprite(ctx, 'battery', this.pos_x, this.pos_y);
    }
}
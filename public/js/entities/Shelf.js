class Shelf extends Entity {
    constructor() {
        super();
        this.filled = false;
    }
    draw(ctx) {
        let filled_status = this.filled ? 'shelf_full' : 'shelf_empty';
        spriteManager.drawSprite(ctx, filled_status, this.pos_x, this.pos_y);
    }
}

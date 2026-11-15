const gameManager = {
    factory: {},
    entities: [],
    player: null,
    laterKill:[],
    initPlayer: function (obj) {
        this.player = obj;
    },
    kill: function (obj) {
        this.laterKill.push(obj);    
    },
    update: function () {
        if (this.player === null) {
            return;
        }
        this.player.move_x = 0;
        this.player.move_y = 0;

        if (eventsManager.action["up"]) this.player.move_y = -1;
        if (eventsManager.action["down"]) this.player.move_y = 1;
        if (eventsManager.action["left"])  this.player.move_x = -1;
        if (eventsManager.action["right"]) this.player.move_x = 1;


        this.entities.forEach(function (e) {
            try { e.update(); } catch (ex) {}
        });
        for (let i = 0; i < this.laterKill.length; i++){
            let idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1) {
                this.entities.splice(idx, 1);
            }
        }
        if (this.laterKill.length > 0) {
            this.laterKill.length = 0;
        }
        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        mapManager.draw(ctx);
        this.draw(ctx);
    },
    loadAll: function () {
        mapManager.loadMap('assets/maps/level1.json');
        spriteManager.loadAtlas('assets/sprites/atlas.json', 'assets/sprites/atlas.png');
        gameManager.factory['Player'] = Player;
        gameManager.factory['Visitor'] = Visitor;
        gameManager.factory['Box'] = Box;
        gameManager.factory['Shelf'] = Shelf;
        gameManager.factory['Exit'] = Exit;
        gameManager.factory['Battery'] = Battery;
        gameManager.factory['Coffee'] = Coffee;
        gameManager.factory['Omamori'] = Omamori;
        mapManager.parseEntities();
        mapManager.draw(ctx);
        eventsManager.setup(canvas);
    },
    draw: function (ctx) {
        for (let e = 0; e < this.entities.length; e++) {
            this.entities[e].draw(ctx);
        }
    },
    play: function () {
        setInterval(updateWorld, 40);
    },
};
function updateWorld() {
    gameManager.update();
}
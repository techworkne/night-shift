const lighting = {
    canvas: null, //холст для темноты
    ctx: null,
    range: 90, // дальность луча в пикселях
    half: Math.PI / 6, // половина ширины луча (30°)
    ambient: 20, // радиус круга вокруг продавца
    flicker: 0, // сколько кадров длится мигание

    init: function (w, h) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext('2d');
    },

    dirAngle: function (dir) {
        return { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir];
    },

    draw: function (ctx) {
        const player = gameManager.player;
        if (this.flicker === 0 && Math.random() < 0.01) {
            this.flicker = 3;
        }
        const showCone = player.battery > 0 && this.flicker === 0;
        if (this.flicker > 0) {
            this.flicker--;
        }
        let px = player.pos_x + 8 - mapManager.view.x;
        let py = player.pos_y + 8 - mapManager.view.y;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(0, 0, 5, 0.97)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'destination-out'; // режим вырезание
        // круг
        let g = this.ctx.createRadialGradient(px, py, 0, px, py, this.ambient);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = g;
        this.ctx.beginPath();
        this.ctx.arc(px, py, this.ambient, 0, Math.PI * 2);
        this.ctx.fill();
        // конус
        if (showCone){
            const g2 = this.ctx.createRadialGradient(px, py, 0, px, py, this.range);
            g2.addColorStop(0, 'rgba(0,0,0,1)');
            g2.addColorStop(1, 'rgba(0,0,0,0)');
            this.ctx.fillStyle = g2;
            const a = this.dirAngle(player.dir);
            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.arc(px, py, this.range, a - this.half, a + this.half);
            this.ctx.closePath();
            this.ctx.fill();
        }
        ctx.drawImage(this.canvas, 0, 0);
    },

    isInLight: function (obj) {
        const player = gameManager.player;
        if (this.flicker > 0) {
            return false;          // свет моргнул — Тень не заморожена
        }
        if(player.battery <= 0){
            return false;
        }
        const dx = (obj.pos_x + obj.size_x / 2) - (player.pos_x + 8);
        const dy = (obj.pos_y + obj.size_y / 2) - (player.pos_y + 8);
        if (Math.hypot(dx, dy) > this.range) return false;
        let diff = Math.atan2(dy, dx) - this.dirAngle(player.dir);

        while (diff > Math.PI)  diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        return Math.abs(diff) < this.half;
    }
}

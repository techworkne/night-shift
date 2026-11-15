const physicManager = {
    update: function (obj) {
        if (obj.move_x === 0 && obj.move_y === 0) {
            return "stop";
        }
        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);

        // стены проверяем по углам объекта, а не только по центру
        // иначе объект наполовину влезает в стеллаж
        let ts = this.wallAt(newX, newY, obj.size_x, obj.size_y);
        let e = this.entityAtXY(obj, newX, newY);
        if (e !== null && obj.onTouchEntity) {
            obj.onTouchEntity(e);
        }
        if (ts !== 0 && obj.onTouchMap) {
            obj.onTouchMap(ts);
        }

        if (ts === 0 && e === null) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else {
            return "break";
        }
        return "move";
    },

    wallAt: function (x, y, w, h) {
        const m = 2;
        const points = [
            [x + m, y + m], [x + w - 1 - m, y + m],
            [x + m, y + h - 1 - m], [x + w - 1 - m, y + h - 1 - m]
        ];
        for (const [px, py] of points) {
            const t = mapManager.getTilesetIdx(px, py);
            if (t !== 0) return t;
        }
        return 0;
    },
    entityAtXY: function (obj, x, y) {
        const pad = 3;
        for (let i = 0; i < gameManager.entities.length; i++) {
            let e = gameManager.entities[i];
            if (e !== obj) {
                if (x + obj.size_x <= e.pos_x + pad ||
                    y + obj.size_y <= e.pos_y + pad ||
                    x >= e.pos_x + e.size_x - pad ||
                    y >= e.pos_y + e.size_y - pad) {
                    continue;
                }
                return e;
            }
        }
        return null;
    }
};

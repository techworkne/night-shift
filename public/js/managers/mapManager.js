const mapManager = {
    mapData: null, // вся карта из JSON (Tiled) после парса
    basePath: '', // папка, где лежит карта;
    tLayers: [], // тайловые слои (floor, walls)
    wallsLayer: null, // слой walls
    xCount: 0, // ширина карты в тайлах
    yCount: 0, // высота карты в тайлах
    mapSize: { x: 64, y: 64 }, // размер карты в пикселях
    tSize: { x: 16, y: 16 }, // размер однонго тайла в пикселях
    tilesets: [], // тайлсеты: картинка + firstgid + сколько тайлов в стр/стл
    imgLoadCount: 0, // каунтер загруженных тайлсетов
    imgLoaded: false, // все ли тайлсеты загружены
    jsonLoaded: false, // весь ли json карты загружен и обработан
    view: { x: 0, y: 0, w: 320, h: 192 }, // камера

    loadMap: function (path) {
        this.reset();
        this.basePath = path.substring(0, path.lastIndexOf('/') + 1);
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                mapManager.parseMap(request.responseText);
            }
        };
        request.open("GET", path, true);
        request.send();
    },

    parseMap: function (tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.tSize.x * this.xCount;
        this.mapSize.y = this.tSize.y * this.yCount;
        for (let i = 0; i < this.mapData.tilesets.length; i++){
            const t = this.mapData.tilesets[i];
            const img = new Image();
            img.onload = function () {
                mapManager.imgLoadCount++;
                if (mapManager.imgLoadCount === mapManager.mapData.tilesets.length) {
                    mapManager.imgLoaded = true;
                }
            };
            img.src = this.basePath + t.image;
            const ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / mapManager.tSize.x),
                yCount: Math.floor(t.imageheight / mapManager.tSize.y)
            };
            this.tilesets.push(ts);
        }
        for (let j = 0; j < this.mapData.layers.length; j++) {
            const layer = this.mapData.layers[j];
            if (layer.type === "tilelayer") {
                this.tLayers.push(layer);
                if (layer.name === "walls") {
                    this.wallsLayer = layer;
                }
            }
        }
        this.jsonLoaded = true;
    },

    reset: function () {
        this.mapData = null;
        this.tLayers = [];
        this.wallsLayer = null;
        this.tilesets = [];
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
    },

    isVisible: function (x, y, width, height) {
        if (x + width < this.view.x || y + height < this.view.y || x > this.view.x + this.view.w || y > this.view.y + this.view.h) {
            return false;
        }
        return true;
    },

    centerAt: function (x, y) {
        if (x < this.view.w / 2) {
            this.view.x = 0;
        } else if (x > this.mapSize.x - this.view.w / 2) {
            this.view.x = this.mapSize.x - this.view.w;
        } else {
            this.view.x = x - (this.view.w / 2);
        }

        if (y < this.view.h/2) {
            this.view.y = 0;
        } else if (y > this.mapSize.y - this.view.h / 2) {
            this.view.y = this.mapSize.y - this.view.h;
        } else {
            this.view.y = y - (this.view.h / 2);
        }
    },

    getTilesetIdx: function (x, y) {
        if (x < 0 || y < 0 || x >= this.mapSize.x || y >= this.mapSize.y) {
            return -1;
        }
        const idx = Math.floor(y / this.tSize.y) * this.xCount + Math.floor(x / this.tSize.x);
        return this.wallsLayer.data[idx];
    },

    draw: function (ctx) {
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(function () { mapManager.draw(ctx) }, 100);
        } else {
            for (let k = 0; k < this.tLayers.length; k++) {
                const layer = this.tLayers[k];
                for (let i = 0; i < layer.data.length; i++) {
                    if (layer.data[i] !== 0) {
                        const tile = this.getTile(layer.data[i]);
                        let pX = (i % this.xCount) * this.tSize.x;
                        let pY = Math.floor(i / this.xCount) * this.tSize.y;
                        if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                            continue;
                        pX -= this.view.x;
                        pY -= this.view.y;
                        ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                    }
                }
            }
            
        }
    },

    getTile: function (tileIndex) {
        const tile = {
            img: null,
            px: 0, py: 0
        };
        const tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        const id = tileIndex - tileset.firstgid;
        const x = id % tileset.xCount;
        const y = Math.floor(id / tileset.xCount);
        tile.px = x * mapManager.tSize.x;
        tile.py = y * mapManager.tSize.y;
        return tile;
    },

    getTileset: function (tileIndex) {
        for (let i = mapManager.tilesets.length - 1; i >= 0; i--){
            if (mapManager.tilesets[i].firstgid <= tileIndex) {
                return mapManager.tilesets[i];
            }
        }
        return null;
    },
    
    parseEntities: function () {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () { mapManager.parseEntities() }, 100);
        } else {
            for (let i = 0; i < this.mapData.layers.length; i++){
                const layer = this.mapData.layers[i];
                if (layer.type === "objectgroup") {
                    for (let j = 0; j < layer.objects.length; j++){
                        const e = layer.objects[j];
                        try {
                            const obj = new gameManager.factory[e.type]();
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            gameManager.entities.push(obj);
                            if (obj.name === "player") {
                                gameManager.initPlayer(obj);
                            }
                        } catch (ex) {
                            console.log("Error while parse Entity: [" + e.gid + "]" + e.type + "," + ex);
                        }
                    }
                }
            }
        }
    }

};

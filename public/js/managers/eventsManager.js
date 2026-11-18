const eventsManager = {
    bind: [],
    action: [],
    setup: function (canvas) {
        this.bind[37] = 'left';
        this.bind[39] = 'right';
        this.bind[38] = 'up';
        this.bind[40] = 'down';
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    },
    onKeyDown: function (event) {
        if (soundManager.context && soundManager.context.state === 'suspended') {
            soundManager.context.resume();
        }
        // M включить/выключить звук
        if (event.keyCode === 77) {
            soundManager.toggleMute();
        }
        let action = eventsManager.bind[event.keyCode];
        if (action) {
            event.preventDefault();
            eventsManager.action[action] = true;
        }
    },
    onKeyUp: function (event) {
        let action = eventsManager.bind[event.keyCode];
        if (action) {
            eventsManager.action[action] = false;
        }
    }
}

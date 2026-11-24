
const touchControls = {
    setup: function () {

        document.addEventListener('pointerdown', function () {
            if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context.resume();
            }
        });

        const arrows = document.querySelectorAll('#touch [data-action]');
        arrows.forEach(function (btn) {
            const action = btn.dataset.action;
            const press = function (e) {
                e.preventDefault();
                eventsManager.action[action] = true;
                btn.classList.add('pressed');
            };
            const release = function () {
                eventsManager.action[action] = false;
                btn.classList.remove('pressed');
            };
            btn.addEventListener('pointerdown', press);
            btn.addEventListener('pointerup', release);
            btn.addEventListener('pointercancel', release); 
            btn.addEventListener('pointerleave', release);
        });

        const mute = document.getElementById('touch-mute');
        if (mute) {
            mute.addEventListener('pointerdown', function (e) {
                e.preventDefault();
                soundManager.toggleMute();
                mute.classList.toggle('off', soundManager.gainNode.gain.value === 0);
            });
        }

    }
};

touchControls.setup();

const touchControls = {
    setup: function () {
    
        document.addEventListener('pointerdown', function () {
            if (soundManager.context && soundManager.context.state === 'suspended') {
                soundManager.context.resume();
            }
        });

        const joy = document.getElementById('joystick');
        const knob = document.getElementById('knob');
        const dirs = ['up', 'down', 'left', 'right'];
        const move = function (e) {
            const r = joy.getBoundingClientRect();
            const R = r.width / 2;                         // радиус джойстика
            let dx = e.clientX - (r.left + R);             // отклонение от центра
            let dy = e.clientY - (r.top + R);
            const len = Math.hypot(dx, dy);
            const maxK = R - knob.offsetWidth / 2;       
            if (len > maxK) {
                dx = dx / len * maxK;
                dy = dy / len * maxK;
            }
            knob.style.transform = `translate(${dx}px, ${dy}px)`;
            const dead = R * 0.35;                 
            eventsManager.action['left']  = dx < -dead;
            eventsManager.action['right'] = dx > dead;
            eventsManager.action['up']    = dy < -dead;
            eventsManager.action['down']  = dy > dead;
        };
        const stop = function () {
            knob.style.transform = '';
            dirs.forEach(function (d) { eventsManager.action[d] = false; });
        };
        joy.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            joy.setPointerCapture(e.pointerId); 
            move(e);
        });
        joy.addEventListener('pointermove', function (e) {
            if (joy.hasPointerCapture(e.pointerId)) move(e);
        });
        joy.addEventListener('pointerup', stop);
        joy.addEventListener('pointercancel', stop);

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
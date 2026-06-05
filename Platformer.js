class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init(data) {
        this.DRAG = 1000;
        this.physics.world.gravity.y = 1750;
        this.physics.world.TILE_BIAS = 24;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 4.0;
        this.TILE_SIZE = 18;
        this.canDie = true;
    }

    createParticles() {
        this.vfx = {};

        this.vfx.coin = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_07.png',
            speed: { min: 10, max: 50 },
            scale: { start: 0.05, end: 0.025 },
            alpha: { start: 1, end: 0 },
            angle: { min: 0, max: 360 },
            lifespan: 2000,
            frequency: -1,
            quantity: 10,
            blendMode: 'NORMAL',
        });

        this.vfx.coin.setDepth(3);

        this.vfx.bgParticles = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'star_01.png',
            speed: (Math.random() - 0.5) * 5,
            scaleX: { start: 2, end: 0.4 },
            scaleY: { start: 0.25, end: 0.05 },
            alpha: { start: 1, end: 0 },
            angle: { min: 0, max: 360 },
            rotation: { min: -360, max: 360 },
            quantity: 1,
            lifespan: 2000,
            frequency: 100,
            blendMode: 'NORMAL',
        });

        this.vfx.bgParticles.setDepth(-5);
    }

    create() {
        this.createParticles();

        this.map = this.add.tilemap("test-platformer", 16, 16, 32, 16);
        this.final_tileset = this.map.addTilesetImage("final_tilemap", "final_tilemap_tiles");

        this.bgLayer = this.map.createLayer("BackGround", [this.final_tileset], 0, 0);
        this.groundLayer = this.map.createLayer("Ground", [this.final_tileset], 0, 0);
        this.lavaLayer = this.map.createLayer("Lava", [this.final_tileset], 0, 0);

        this.groundLayer.setCollisionByExclusion([-1]);

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "pixel_sheet",
            frame: 151
        });

        this.coins.forEach(c => c.setDepth(2));

        this.spawns = this.map.createFromObjects("Objects", {
            name: "spawn",
            key: "pixel_sheet",
            frame: 111
        });

        this.spawns.forEach(s => s.setDepth(0));

        this.spikes = this.map.createFromObjects("Objects", {
            name: "spike",
            key: "pixel_sheet",
            frame: 68
        });

        this.spikes.forEach(s => s.setDepth(2));

        this.superspikes = this.map.createFromObjects("Objects", {
            name: "super_spike",
            key: "final_sheet",
            frame: 1
        });

        this.superspikes.forEach(s => s.setDepth(2));

        this.springs = this.map.createFromObjects("Objects", {
            name: "spring",
            key: "pixel_sheet",
            frame: 108
        });

        this.springs.forEach(s => s.setDepth(2));

        this.powerUps = this.map.createFromObjects("Objects", {
            name: "mushroom",
            key: "pixel_sheet",
            frame: 128
        });

        this.powerUps.forEach(p => p.setDepth(2));

        this.charges = this.map.createFromObjects("Objects", {
            name: "charge",
            key: "final_sheet",
            frame: 60
        });

        this.charges.forEach(c => c.setDepth(2));

        this.shells = this.map.createFromObjects("GravObjects", {
            name: "shell",
            key: "final_sheet",
            frame: 68
        });

        this.shells.forEach(s => {
            s.setDepth(0);
            s.isGravObject = true;
        });

        this.gravSprings = this.map.createFromObjects("GravObjects", {
            name: "grav_spring",
            key: "final_sheet",
            frame: 48
        });

        this.gravSprings.forEach(g => {
            g.setDepth(0);
            g.isGravObject = true;
        });

        this.anims.create({
            key: 'coinAnim',
            frames: this.anims.generateFrameNumbers('pixel_sheet', {
                start: 151,
                end: 152
            }),
            duration: 250,
            repeat: -1
        });

        this.anims.create({
            key: 'spawnAnim',
            frames: this.anims.generateFrameNumbers('pixel_sheet', {
                start: 111,
                end: 112
            }),
            duration: 250,
            repeat: -1
        });

        this.anims.create({
            key: 'springAnim',
            frames: this.anims.generateFrameNumbers('pixel_sheet', {
                start: 107,
                end: 108
            }),
            duration: 50,
            repeat: 0
        });

        this.anims.create({
            key: 'chargeAnim',
            frames: this.anims.generateFrameNumbers('final_sheet', {
                start: 60,
                end: 63
            }),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'gravSpringAnim',
            frames: this.anims.generateFrameNumbers('final_sheet', {
                frames: [48, 49, 50, 48]
            }),
            duration: 100,
            repeat: 0
        });

        this.anims.play('coinAnim', this.coins);
        this.anims.play('spawnAnim', this.spawns);
        this.anims.play('chargeAnim', this.charges);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spawns, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.superspikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.powerUps, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.springs, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.charges, Phaser.Physics.Arcade.STATIC_BODY);

        this.physics.world.enable(this.shells, Phaser.Physics.Arcade.DYNAMIC_BODY);
        this.physics.world.enable(this.gravSprings, Phaser.Physics.Arcade.DYNAMIC_BODY);

        this.shells.forEach(s => {
            s.body.setBounce(1.0, 0.0);
        });

        this.gravSprings.forEach(g => {
            g.body.setBounce(0.5, 0.0);
        });

        this.physics.add.collider(this.shells, this.groundLayer);
        this.physics.add.collider(this.gravSprings, this.groundLayer);

        this.spikes.forEach(spike => {
            const baseWidth = 8;
            const baseHeight = 4;
            const baseCenterX = 0;
            const baseCenterY = spike.height / 4;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, spike);
        });

        this.superspikes.forEach(spike => {
            const baseWidth = 8;
            const baseHeight = 4;
            const baseCenterX = 0;
            const baseCenterY = spike.height / 4;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, spike);
        });

        this.springs.forEach(spring => {
            const baseWidth = 12;
            const baseHeight = 8;
            const baseCenterX = 0;
            const baseCenterY = (spring.height - (baseHeight + 12)) / 2;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, spring);
        });

        this.shells.forEach(shell => {
            const baseWidth = 16;
            const baseHeight = 12;
            const baseCenterX = 0;
            const baseCenterY = (shell.height - baseHeight) / 2;

            this.rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, shell);
        });

        this.coinGroup = this.add.group(this.coins);
        this.spawnGroup = this.add.group(this.spawns);
        this.spikeGroup = this.add.group(this.spikes);
        this.superspikeGroup = this.add.group(this.superspikes);
        this.powerUpsGroup = this.add.group(this.powerUps);
        this.springGroup = this.add.group(this.springs);
        this.chargeGroup = this.add.group(this.charges);
        this.shellGroup = this.add.group(this.shells);
        this.gravSpringGroup = this.add.group(this.gravSprings);

        this.spawn = this.spawnGroup.getChildren()[0];
        console.log(this.spawn);
        this.start = {
            x: this.spawn.x,
            y: this.spawn.y
        };

        this.cursors = {};
        this.cursors.left = this.input.keyboard.addKey('A');
        this.cursors.right = this.input.keyboard.addKey('D');
        this.cursors.up = this.input.keyboard.addKey('W');
        this.cursors.down = this.input.keyboard.addKey('S');

        this.cursors.jump = this.input.keyboard.addKey('SPACE');
        this.cursors.twirl = this.input.keyboard.addKey('PERIOD');
        this.cursors.dash = this.input.keyboard.addKey('COMMA');
        this.cursors.grab = this.input.keyboard.addKey('E');
        this.cursors.spin = this.input.keyboard.addKey('L');

        this.rKey = this.input.keyboard.addKey('R');

        this.prevPadState = {
            jump: false,
            twirl: false,
            dash: false,
            grab: false,
            spin: false
        };

        this.padJumpJustPressed = false;
        this.padTwirlJustPressed = false;
        this.padDashJustPressed = false;
        this.padGrabJustPressed = false;
        this.padSpinJustPressed = false;

        this.padJumpHeld = false;
        this.padGrabHeld = false;
        this.padSpinHeld = false;

        my.sprite.player = new Player(this, this.start.x, this.start.y, "platformer_characters", "tile_0000.png", this.cursors);
        my.sprite.player.setDepth(1);

        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // LAVA DEATH WITH FADE
        this.physics.add.overlap(my.sprite.player, this.lavaLayer, (obj1, obj2) => {
            this.deathFadeRespawn();
        }, (obj1, obj2) => {
            return obj2.index !== -1;
        });

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.vfx.coin.emitParticleAt(obj2.x, obj2.y);
            obj2.destroy();
        });

        this.physics.add.overlap(my.sprite.player, this.spawnGroup, (obj1, obj2) => {
            this.start = {
                x: obj2.x,
                y: obj2.y
            };
        });

        // SPIKE DEATH WITH FADE
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            if (!this.canDie) return;

            const playerBottom = my.sprite.player.body.y + my.sprite.player.body.height;
            const spikeTop = obj2.body.y;

            const aboveSpike = playerBottom <= spikeTop + 4;

            if (my.sprite.player.isSpin && aboveSpike) {
                my.sprite.player.body.velocity.y = my.sprite.player.JUMP_VELOCITY * my.sprite.player.SPIN_MULTIPLIER;
            } else {
                this.deathFadeRespawn();
            }
        });

        // SUPER SPIKE DEATH WITH FADE
        this.physics.add.overlap(my.sprite.player, this.superspikeGroup, (obj1, obj2) => {
            this.deathFadeRespawn();
        });

        this.physics.add.overlap(my.sprite.player, this.powerUpsGroup, (obj1, obj2) => {
            obj2.destroy();
            this.isPoweredUp = true;

            let powerUpTween = this.tweens.add({
                targets: my.sprite.player,
                onComplete: () => {
                    this.isPoweredUp = false;
                }
            });
        });

        this.physics.add.overlap(my.sprite.player, this.chargeGroup, (obj1, obj2) => {
            if (obj2.body.visible === false) return;

            my.sprite.player.isDash = true;
            obj2.body.visible = false;

            this.time.delayedCall(5000, () => {
                obj2.body.visible = true;
            });
        });

        this.physics.add.overlap(my.sprite.player, this.springGroup, (obj1, obj2) => {
            const SPRING_FORCE = 500;

            let angle = Phaser.Math.DegToRad(obj2.angle - 90);

            let cos = Math.cos(angle);
            let sin = Math.sin(angle);

            my.sprite.player.body.setVelocity(cos * SPRING_FORCE, sin * SPRING_FORCE);
            my.sprite.player.isDash = true;

            this.anims.play('springAnim', obj2);
        });

        this.physics.add.overlap(my.sprite.player, this.gravSpringGroup, (obj1, obj2) => {
            console.log("GRAV SPRING OVERLAP WEEEWOOO WEEEHOOO");

            if (my.sprite.player.isGrabInteractable == false) return;
            if (my.sprite.player.holdingSomething && my.sprite.player.grabbedObject == obj2) return;

            const SPRING_FORCE = 500;

            let angle = Phaser.Math.DegToRad(obj2.angle - 90);

            let cos = Math.cos(angle);
            let sin = Math.sin(angle);

            let springCenterX = obj2.body.x + obj2.width / 2;
            let springCenterY = obj2.body.y + obj2.height / 2;
            let playerCenterX = my.sprite.player.body.x + my.sprite.player.body.width / 2;
            let playerCenterY = my.sprite.player.body.y + my.sprite.player.body.height / 2;

            let dx = playerCenterX - springCenterX;
            let dy = playerCenterY - springCenterY;

            let dot = dx * cos + dy * sin;

            const THRESHOLD = obj2.height / 8;
            if (Math.abs(dot) < THRESHOLD) return;

            let dir = dot > 0 ? 1 : -1;

            my.sprite.player.body.setVelocity(dir * cos * SPRING_FORCE, dir * sin * SPRING_FORCE);
            my.sprite.player.isDash = true;

            this.anims.play('gravSpringAnim', obj2);

            if (dir > 0) {
                obj2.flipX = false;
                obj2.flipY = false;
            } else {
                obj2.flipX = true;
                obj2.flipY = true;
            }
        });

        this.physics.add.overlap(my.sprite.player, this.shellGroup, (obj1, obj2) => {
            if (my.sprite.player.isGrabInteractable == false || obj2.cantCollide) return;
            if (my.sprite.player.holdingSomething && my.sprite.player.grabbedObject == obj2) return;

            let shellCenterX = obj2.body.x + obj2.width / 2;
            let playerCenterX = my.sprite.player.body.x + my.sprite.player.body.width / 2;

            let dx = playerCenterX - shellCenterX;

            const COLLISION_THRESHOLD = obj2.height * (2.0 / 4.0);

            const shellTop = obj2.body.y;
            const playerBottom = my.sprite.player.body.y + my.sprite.player.body.height;
            const aboveShell = playerBottom <= shellTop + COLLISION_THRESHOLD;

            const THROW_STRENGTH = 250.0;

            if (Math.abs(obj2.body.velocity.x) < THROW_STRENGTH / 2.0) {
                let dir = dx < 0 ? 1 : -1;
                obj2.body.setVelocityX(dir * THROW_STRENGTH);
                obj2.noGroundDrag = true;
                obj2.body.setDragX(0);

            } else if (aboveShell) {
                my.sprite.player.body.velocity.y = my.sprite.player.JUMP_VELOCITY * my.sprite.player.SPIN_MULTIPLIER;
                obj2.body.setVelocityX(0);

                my.sprite.player.shellJumpWindow = true;
                my.sprite.player.shellJumpTimer = my.sprite.player.SHELL_JUMP_WINDOW;

            } else {
                this.deathFadeRespawn();
                console.log("failed shell jump");
            }

            obj2.cantCollide = true;

            this.time.delayedCall(100, () => {
                obj2.cantCollide = false;
            });
        });

        this.input.keyboard.on('keydown-CTRL', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;

            if (this.physics.world.debugGraphic) {
                this.physics.world.debugGraphic.clear();
            }

            if (this.physics.world.drawDebug) {
                this.physics.world.createDebugGraphic();
            }
        }, this);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        const cam = this.cameras.main;
        const camW = cam.width / cam.zoom;
        const camH = cam.height / cam.zoom;

        this.vfx.bgParticles.addEmitZone({
            type: 'random',
            source: new Phaser.Geom.Rectangle(-camW / 2, -camH / 2, camW, camH),
        });

        this.map.layers.forEach(layerData => {
            layerData.data.forEach(row => {
                row.forEach((tile, i) => {
                    if (tile === null) {
                        row[i] = new Phaser.Tilemaps.Tile(layerData, -1, 0, 0, this.map.tileWidth, this.map.tileHeight, this.map.tileWidth, this.map.tileHeight);
                    }
                });
            });
        });

        this.animatedTiles.init(this.map);
    }

    update(time, delta) {
        let dt = delta / 1000;

        const pad = this.input.gamepad.getPad(0);

        if (pad) {
            const rawX = pad.leftStick.x;
            const rawY = pad.leftStick.y;
            const DEAD_ZONE = 0.35;

            my.sprite.player.stickX = Math.abs(rawX) > DEAD_ZONE ? rawX : 0;
            my.sprite.player.stickY = Math.abs(rawY) > DEAD_ZONE ? rawY : 0;

            const jumpPressed = pad.buttons[0].pressed;
            const twirlPressed = pad.buttons[5].pressed;
            const dashPressed = pad.buttons[7].pressed;
            const grabPressed = pad.buttons[2].pressed;
            const spinPressed = pad.buttons[4].pressed;

            this.padJumpJustPressed = jumpPressed && !this.prevPadState.jump;
            this.padTwirlJustPressed = twirlPressed && !this.prevPadState.twirl;
            this.padDashJustPressed = dashPressed && !this.prevPadState.dash;
            this.padGrabJustPressed = grabPressed && !this.prevPadState.grab;
            this.padSpinJustPressed = spinPressed && !this.prevPadState.spin;

            this.padJumpHeld = jumpPressed;
            this.padGrabHeld = grabPressed;
            this.padSpinHeld = spinPressed;

            this.prevPadState = {
                jump: jumpPressed,
                twirl: twirlPressed,
                dash: dashPressed,
                grab: grabPressed,
                spin: spinPressed
            };
        }

        const cam = this.cameras.main;

        this.vfx.bgParticles.setPosition(cam.scrollX + cam.width / 2, cam.scrollY + cam.height / 2);

        this.shells.forEach(shell => {
            if (shell.body.blocked.down && !shell.noGroundDrag) {
                shell.body.setDragX(this.DRAG);
                console.log("SHELL DRAG");
            } else {
                shell.body.setDragX(0);
            }
        });

        this.gravSprings.forEach(gSpring => {
            if (gSpring.body.blocked.down) {
                gSpring.body.setDragX(this.DRAG);
                console.log("GRAV SPRING DRAG");
            } else {
                gSpring.body.setDragX(0);
            }
        });

        my.sprite.player.update(time, delta);

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }

    deathFadeRespawn() {
        if (!this.canDie) return;

        this.canDie = false;
        my.sprite.player.isRespawning = true;
        my.sprite.player.setVelocity(0, 0);

        this.cameras.main.fadeOut(300, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            my.sprite.player.setPosition(this.start.x, this.start.y);
            my.sprite.player.setVelocity(0, 0);

            this.cameras.main.fadeIn(300, 0, 0, 0);

            this.time.delayedCall(600, () => {
                this.canDie = true;
                my.sprite.player.isRespawning = false;
            });
        });
    }

    rotateHitbox(baseWidth, baseHeight, baseCenterX, baseCenterY, object) {
        const angle = Phaser.Math.DegToRad(Math.round(object.angle));

        const centerX = object.width / 2;
        const centerY = object.height / 2;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const rotatedW = baseWidth * Math.abs(cos) + baseHeight * Math.abs(sin);
        const rotatedH = baseWidth * Math.abs(sin) + baseHeight * Math.abs(cos);
        const rotatedCenterX = baseCenterX * cos - baseCenterY * sin;
        const rotatedCenterY = baseCenterX * sin + baseCenterY * cos;

        const offsetX = centerX + rotatedCenterX - rotatedW / 2;
        const offsetY = centerY + rotatedCenterY - rotatedH / 2;

        object.body.setSize(rotatedW, rotatedH);
        object.body.setOffset(offsetX, offsetY);
    }

    parallaxify(layer, ratioX, ratioY, positionX = 0, positionY = 0, scaleX = 1, scaleY = 1) {
        layer.setScrollFactor(ratioX, ratioY);
        layer.setScale(scaleX, scaleY);
        layer.setPosition(positionX, positionY);
    }
}

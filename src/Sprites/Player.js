class Player extends Phaser.Physics.Arcade.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, cursors, showHitboxes = false) {
        super(scene, x, y, texture, frame);
        
        this.cursors = cursors;
        this.stickX = 0;
        this.stickY = 0;

        this.score = 0;
        //this.bulletSpeed = -1000;
        //this.isActive = true;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        //this.body.setSize(20, 40);
        //this.body.setOffset(5, 8);

        this.bodyW = this.width * (1/2);
        this.bodyH = this.height * (3/8)
        this.bodyOffX = this.bodyW / 2;
        this.bodyOffY = this.height - this.bodyH;


        this.body.setSize(this.bodyW, this.bodyH);
        this.body.setOffset(this.bodyOffX, this.bodyOffY);

        this.init();
        return this;
    }

    init() {

        this.isGrab = false;
        this.holdingSomething = false;
        this.grabbedObject = null;

        this.isSpin = true;
        this.SPIN_MULTIPLIER = 0.5;

        this.isTwirl = true;
        this.TWIRL_MULTIPLIER = 0.35;

        this.upPressed = false;
        this.isJumping = false;
        this.JUMP_CUT_MULTIPLIER = 0.35;

        this.isDash = false;
        this.isDashing = false;
        this.DASH_DIRECTIONAL_VELOCITY = 500;

        this.isCrouching = false;

        this.ACCELERATION = 400;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide

        this.MAX_VELOCITY_X = 400;
        this.MAX_VELOCITY_Y = 500;
        this.JUMP_VELOCITY = -500;

        this.setMaxVelocity(this.MAX_VELOCITY_X, this.MAX_VELOCITY_Y);

        this.CAYOTE_TIME = 100; 
        this.coyoteTimer = 0;

        this.JUMP_BUFFER_TIME = 100;
        this.jumpBufferTimer = 0;
    }

    update(time, delta) {

        const jumpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.jump) || this.scene.padJumpJustPressed;
        const twirlJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.twirl) || this.scene.padTwirlJustPressed;
        const grabJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.grab) || this.scene.padGrabJustPressed;
        const dashJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.dash) || this.scene.padDashJustPressed;
        this.isGrab = this.cursors.grab.isDown || this.scene.padGrabHeld;
        this.isSpin = this.cursors.spin.isDown || this.scene.padSpinHeld;

        if (this.isSpin) console.log("IS SPIN");

        // Check Horizontal Movement
        // =========================

        let inputX = 0;
        if (this.cursors.left.isDown) inputX -= 1;
        if (this.cursors.right.isDown) inputX += 1;

        if (Math.abs(this.stickX) > Math.abs(inputX)){
            inputX = this.stickX;
        }

        if (inputX !== 0) {
            this.setAccelerationX(inputX * this.ACCELERATION);
            this.setFlip(inputX > 0, false);
            //console.log(`InputX: ${inputX}`);
            this.anims.play('walk', true);
        } else {
            // Set acceleration to 0 and have DRAG take over
            this.setAccelerationX(0);
            this.setDragX(this.DRAG);
            this.anims.play('idle');
            // TODO: have the vfx stop playing
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if (!this.body.blocked.down) {
            this.anims.play('jump');
            this.coyoteTimer += delta; // * (this.velocityX /this.MAX_VELOCITY_X)
        }

        if (this.body.blocked.down) {
            this.coyoteTimer = 0;
            //this.isJumping = false;
            //this.setScale(1.0);
        }


        // Check Crouch State
        // ==================

        let inputY = 0;

        if (this.cursors.up.isDown) inputY -= 1;
        if (this.cursors.down.isDown) inputY += 1;

        if (Math.abs(this.stickY) > Math.abs(inputY)){
            inputY = this.stickY;
            //console.log(`InputY: ${inputY}`);
        }

        if (inputY > 0.5) {
            this.anims.play('crouch', true);
            let shiftBodyH = this.bodyH / 2;
            this.body.setSize(this.bodyW, shiftBodyH);
            this.body.setOffset(this.bodyOffX, this.height - shiftBodyH);
        } else {
            this.body.setSize(this.bodyW, this.bodyH);
            this.body.setOffset(this.bodyOffX, this.bodyOffY);
        }

        // Check for a twirl jump
        // ======================

        if (twirlJustDown && this.isTwirl) {
            console.log("IS TWIRLING");
            this.body.velocity.y = this.JUMP_VELOCITY * this.TWIRL_MULTIPLIER;
            this.isTwirl = false;
            this.scene.time.delayedCall(250, () => {
                this.isTwirl = true;
            });
        }

        // Update jump buffer timer
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer -= delta;
        }

        if (jumpJustDown){
            this.jumpBufferTimer = this.JUMP_BUFFER_TIME;
        }

        if (this.jumpBufferTimer > 0) {
            if (this.coyoteTimer < this.CAYOTE_TIME) {
                this.body.setVelocityY(this.JUMP_VELOCITY);
                this.coyoteTimer = this.CAYOTE_TIME; // Reset coyote timer
                this.isJumping = true;

            } else if (this.body.blocked.left || this.body.blocked.right) {
                this.body.setVelocityX(this.body.blocked.left ? this.MAX_VELOCITY_X / 2 : -this.MAX_VELOCITY_X / 2);
                this.body.setVelocityY(this.JUMP_VELOCITY);
                this.isJumping = true;
            }
        }  

        if (this.isJumping && this.body.velocity.y < 0) {
            
            const jumpReleased = !this.cursors.jump.isDown && !this.scene.padJumpHeld;

            if (jumpReleased) {
                this.body.setVelocityY(this.body.velocity.y * this.JUMP_CUT_MULTIPLIER);
                this.isJumping = false;
            }

        } else if (this.body.blocked.down) {
            this.isJumping = false;
        }

        // Do dash
        // =======

        if (dashJustDown && this.isDash){

            console.log("IS DASHING");
            let dx = inputX;
            let dy = inputY;
            
            if(dx === 0 && dy === 0){
                dx = this.flipX ? 1 : -1;
            }

            const length = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / length;
            const ny = dy / length;

            this.body.setVelocity(
                nx * this.DASH_DIRECTIONAL_VELOCITY,
                ny * this.DASH_DIRECTIONAL_VELOCITY
            );

            this.isDash = false;
            this.isDashing = true;
        }

        // Do Grab
        // =======

        if (this.isGrab && !this.holdingSomething){
            console.log("IS GRABBING");

            const grabOffsetX = this.flipX ? -this.body.width / 2 : this.body.width / 2;
            const grabX = this.x + grabOffsetX;
            const grabY = this.y;
            const grabRadius = 20;

            const grabbed = this.scene.physics.overlapCirc(grabX, grabY, grabRadius, true, true)
                .filter(body => body.gameObject !== this && body.gameObject.isGravObject)
                .map(body => body.gameObject);
            
            if (grabbed.length > 0 && this.holdingSomething == false) {
                this.holdingSomething = true;
                this.grabbedObject = grabbed[0];
            }
        }

        if (this.holdingSomething && this.grabbedObject) {
            const grabOffsetX = this.flipX ? this.body.width / 2 : -this.body.width / 2;
            const grabX = this.x + grabOffsetX;
            const grabY = this.y;
            this.grabbedObject.setPosition(grabX, grabY);
            this.grabbedObject.body.setVelocity(this.body.velocity.x, this.body.velocity.y);
        }

        if (!this.isGrab && this.holdingSomething) {
            if(this.grabbedObject){
                
                let dx = inputX;
                let dy = inputY;

                const releaseStrength = 250;
                
                dx = dx === 0 ? (this.flipX ? 1 : -1) : dx;

                if (dy < -0.5) {
                    this.grabbedObject.body.setVelocity(dx * releaseStrength / 4, -releaseStrength * 3);
                } else {
                    this.grabbedObject.body.setVelocity(dx * releaseStrength, -releaseStrength/3);
                }
            }

            this.grabbedObject = null;
            this.holdingSomething = false;

        }
    }
}
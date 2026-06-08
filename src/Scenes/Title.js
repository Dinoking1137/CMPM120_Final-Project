class Title extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create() {
        this.myText = this.add.text(config.width / 2, config.height / 2, 
            `Meep Faces His Fear Of the Dark\nPress SPACE to Begin`, 
            { font: "48px Trebuchet", fill: "#7e73bf", align: "center"});
        this.myText.setOrigin(0.5, 0.5);
        this.myText.setAlpha(0.1);

        let textTween = this.tweens.add({
            targets: this.myText,
            alpha: 1,
            ease: 'in',
            duration: 2000
        });

        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.onControls = false;
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            //if not on credits screen already, continue text
            if (!this.onControls) {
                this.myText.setText(`--Controls--\n\nA and D: Left, right\nS: Crouch\nSpace: Jump\nK: Grab\n,: Dash\n\npress SPACE again to actually begin`);

                this.onControls = true;
            }
            else {
                this.scene.start("platformerScene");
            }
        }
    }
}
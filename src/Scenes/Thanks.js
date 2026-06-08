class Thanks extends Phaser.Scene {
    constructor() {
        super("thanksScene");

        this.onCredits = false;
    }

    create() {
        this.myText = this.add.text(config.width / 2, config.height / 2, 
            `I'm glad it's over but I feel stronger now...\nPress SPACE to continue`, 
            { font: "48px Trebuchet", fill: "#7e73bf", align: "center"});
        this.myText.setOrigin(0.5, 0.5);

        this.spaceKey = this.input.keyboard.addKey('SPACE');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            //if not on credits screen already, continue text
            if (!this.onCredits) {
                this.myText.setText(`Thanks for playing!\n\nMade by Ziggy Henry, Chloe Engel, and Aaron Kosoff\nForked by Ziggy Henry (check the pdf)\n\nPress SPACE to restart`);
                
                this.onCredits = true;
            }
            else {
                this.scene.start("titleScene");
            }
        }
    }
}
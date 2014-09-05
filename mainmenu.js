

Tetris.MainMenu = function(game){ }; 

Tetris.MainMenu.prototype = { 

    preload : function(){ 
        spaceBar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }, 
 
    create : function(){ 
        this.game.stage.backgroundColor = '#000000';
        var titleText = this.game.add.text(this.game.world.centerX,this.game.world.height/3, 'TETRIS', { font: '32px Arial', fill: '#fff' });
        titleText.setShadow(3,3,'rgba(200,100,100,255',0);
        titleText.anchor.set(0.5);
        var lineTwo = this.game.add.text(this.game.world.centerX,titleText.y+40, 'made with PhaserJS', { font: '32px Arial', fill: '#fff' });
        lineTwo.setShadow(3,3,'rgba(200,100,100,255',0);
        lineTwo.anchor.set(0.5);
        var lineThree = this.game.add.text(this.game.world.centerX,titleText.y+130, 'PRESS SPACE TO PLAY', { font: '32px Arial', fill: '#fff' });
        lineThree.setShadow(3,3,'rgba(200,100,100,255',0);
        lineThree.anchor.set(0.5);
        var lineFour = this.game.add.text(this.game.world.centerX,titleText.y+170, 'ARROW KEYS TO MOVE TILE', { font: '32px Arial', fill: '#fff' });
        lineFour.setShadow(3,3,'rgba(200,100,100,255',0);
        lineFour.anchor.set(0.5);

        var made = this.game.add.text(this.game.world.centerX,this.game.world.height-50, 'Juhana Paavola - 2014', { font: '32px Arial', fill: '#fff' });
        made.setShadow(3,3,'rgba(200,100,100,255',0);
        made.anchor.set(0.5);        
    }, 
 
    update : function(){
        if(spaceBar.isDown){
            this.game.state.start('Game');
        }
    } 
};

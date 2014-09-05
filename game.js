Tetris.Game = function(game){ }; 

Tetris.Game.prototype = { 
	
	cursors:{},
	level : 1,
	score : 0,
	scoreText : '',
	levelText : '',
	timestamp:0,
	timestampPlayerMove : 0,
	totalRemovedRows:0,
	moveTileTimeStep:1000,
	tiles : [
		{
			name:'L',
			tile:[{x:7,y:0},{x:7,y:1},{x:7,y:2},{x:8,y:2}],
			facing:'right',
			image:'redtile'
		},
		{
			name:'Lrev',
			tile:[{x:7,y:0},{x:7,y:1},{x:7,y:2},{x:6,y:2}],
			facing:'right',
			image:'purpletile'
		},
		{
			name:'I',
			tile:[{x:7,y:0},{x:7,y:1},{x:7,y:2},{x:7,y:3}],
			facing:'right',
			image:'whitetile'
		},
		{
			name:'T',
			tile:[{x:7,y:0},{x:6,y:1},{x:7,y:1},{x:8,y:1}],
			facing:'up',
			image:'yellowtile'
		},
		{
			name:'box',
			tile:[{x:7,y:0},{x:8,y:0},{x:7,y:1},{x:8,y:1}],
			facing:'up',
			image:'bluetile'
		}
	],
	limit : {
		left:0,
		right:15,
		bottom:15
	},
	movingTile : {},
	standingTiles : [],
	tileSize : 32,

    preload : function(){ 
		this.game.load.image('bluetile', 'img/bluetile.png');	
		this.game.load.image('yellowtile', 'img/yellowtile.png');
		this.game.load.image('whitetile', 'img/whitetile.png');
		this.game.load.image('purpletile', 'img/purpletile.png');
		this.game.load.image('redtile', 'img/redtile.png');
		this.game.load.image('graytile', 'img/graytile.png');
    }, 
 
    create : function(){ 
    	this.game.stage.backgroundColor = '#222222';
		this.cursors = this.game.input.keyboard.createCursorKeys();
		
		var width = this.game.world.width/this.tileSize;
		var height = this.game.world.height/this.tileSize;
		for(var row=0;row<height;row++){
			for(var col=0;col<width;col++){
				if(col<=this.limit.left || col>=this.limit.right){
					var pos = this.tileToScreen(col,row);
					this.game.add.sprite(pos.x,pos.y,'graytile');
				}
			}
		}

		var pos = this.tileToScreen(this.limit.right,0);
		var scoretext = this.game.add.text(pos.x,pos.y, 'SCORE', { font: '32px Arial', fill: '#fff' });
        scoretext.setShadow(3,3,'rgba(200,100,100,255',0);
		pos = this.tileToScreen(this.limit.right,1);
		this.scoreText = this.game.add.text(pos.x,pos.y, ''+this.score, { font: '32px Arial', fill: '#fff' });
		this.scoreText.setShadow(3,3,'rgba(200,100,100,255',0);
		pos = this.tileToScreen(this.limit.right,2);
		var leveltext = this.game.add.text(pos.x,pos.y, 'LEVEL', { font: '32px Arial', fill: '#fff' });
		leveltext.setShadow(3,3,'rgba(200,100,100,255',0);
		pos = this.tileToScreen(this.limit.right,3);
		this.levelText = this.game.add.text(pos.x,pos.y, ''+this.level, { font: '32px Arial', fill: '#fff' });
		this.levelText.setShadow(3,3,'rgba(200,100,100,255',0);

		this.generateTile();
    }, 
 
    update : function(){
		var checkRow = false;
		if(this.game.time.now-this.timestamp>this.moveTileTimeStep){
			this.timestamp = this.game.time.now;
			this.moveTile(0,1);
			checkRow=true;
		}
		if(this.game.time.now-this.timestampPlayerMove>100){
			this.timestampPlayerMove = this.game.time.now;
			if(this.cursors.up.isDown){
				this.rotateTile();
				checkRow=true;
			}

			if(this.cursors.left.isDown){
				this.moveTile(-1,-1);
				checkRow=true;
			}else if(this.cursors.right.isDown){
				this.moveTile(1,-1);
				checkRow=true;
			}
			if(this.cursors.down.isDown){
				this.moveTile(0,1);
				checkRow=true;
			}		
		}

		if(checkRow){
			this.rowReady();	
		}

    },

    generateTile : function(){	
		var ind = Math.floor(Math.random()*(this.tiles.length));
		var t = this.tiles[ind].tile;
		var hasSpace = true;
		// is there space ?
		for(var i=0;i<t.length;i++){
			if(this.isTileInIndex(t[i].x,t[i].y)){
				hasSpace=false;
			}
		}
		if(hasSpace){
			this.movingTile = this.game.add.group();
			for(var i=0;i<t.length;i++){
				this.movingTile.create(t[i].x*this.tileSize,t[i].y*this.tileSize,this.tiles[ind].image);	
			}	
			this.movingTile.name = this.tiles[ind].name;
			this.movingTile.facing = this.tiles[ind].facing;
		}else{
			//gameover
			this.game.state.start('MainMenu');
		}
	},

	screenToTile : function(x,y){
		return {x:x/this.tileSize,y:y/this.tileSize};
	},

	tileToScreen : function(x,y){
		return {x:x*this.tileSize,y:y*this.tileSize};
	},

	moveTile : function(x,y){
		var stopMoving = false;

		var hor = 0;
		var ver = 0;
		if(x<0) hor=-this.tileSize;
		if(x>0) hor=this.tileSize;
		if(y>0) ver = this.tileSize;
		if(y<0) ver = -this.tileSize;
		this.movingTile.forEach(function(child){
			c = this.screenToTile(child.x,child.y);
			if(this.isTileInIndex(c.x-1,c.y) ||
				this.isTileInIndex(c.x+1,c.y)){
				hor = 0;
			}
			if(this.isTileInIndex(c.x,c.y+1)){
				ver = 0;
			}

			if(c.y+1==this.limit.bottom) ver=0;
			if(c.x-1==this.limit.left) hor = 0;
			if(c.x+1==this.limit.right) hor=0;

			if(x<0 && !this.isTileInIndex(c.x-1,c.y) && c.x+1==this.limit.right){
				hor = -this.tileSize;
			}
			if(x>0 && !this.isTileInIndex(c.x+1,c.y) && c.x-1==this.limit.left){
				hor=this.tileSize;
			}

		},this);			

		if(ver==0){
			this.standingTiles.push(this.movingTile);
			this.generateTile();
		}else{
			if(ver<0)ver=0;
			this.movingTile.forEach(function(child){
				child.x+=hor;
				child.y+=ver;
			},this);
		}
	},

	isTileInIndex : function(x,y){
		for(var i=0;i<this.standingTiles.length;i++){
			var g = this.standingTiles[i];
			var found = false;
			g.forEach(function(child){
				var c = this.screenToTile(child.x,child.y);
				if(c.x==x && c.y==y) found = true;
			},this);

			if(found) return true;
		}
		return false;
	},

	rotateTile : function(){
		var canRotate = true;
		if(this.movingTile.name=='L'){
			var matrix = [];
			var facing = '';
			if(this.movingTile.facing=='right'){
				matrix.push({x:-1,y:1},
					{x:1,y:-1},
					{x:0,y:-2});
				facing = 'up';
			}else if(this.movingTile.facing=='up'){
				matrix.push({x:1,y:1},
					{x:-1,y:-1},
					{x:-2,y:0});

				facing = 'left';
			}else if(this.movingTile.facing=='left'){
				matrix.push({x:1,y:-1},
					{x:-1,y:1},
					{x:0,y:2});

				facing = 'down';
			}else if(this.movingTile.facing=='down'){
				matrix.push({x:-1,y:-1},
					{x:1,y:1},
					{x:2,y:0});
				facing = 'right';
			}

			var first = this.screenToTile(this.movingTile.getAt(0).x,this.movingTile.getAt(0).y);
			var last = this.screenToTile(this.movingTile.getAt(3).x,this.movingTile.getAt(3).y);
			first.x+=matrix[0].x;
			first.y+=matrix[0].y;
			last.x+=matrix[2].x;
			last.y+=matrix[2].y;
			if(this.isTileInIndex(first.x,first.y) || this.isTileInIndex(last.x,last.y)){
				canRotate = false;
			}
			if( first.x==this.limit.left || last.x==this.limit.left || first.x==this.limit.right || last.x==this.limit.right){
				canRotate=false;
			}
			if(first.y==this.limit.bottom || last.y==this.limit.bottom){
				canRotate=false;
			}

			if(canRotate){
				this.rotateWithTileCoord(this.movingTile.getAt(0),matrix[0].x,matrix[0].y);
				this.rotateWithTileCoord(this.movingTile.getAt(2),matrix[1].x,matrix[1].y);
				this.rotateWithTileCoord(this.movingTile.getAt(3),matrix[2].x,matrix[2].y);
				this.movingTile.facing = facing;
			}
		}else if(this.movingTile.name=='I'){
			var matrix = [];
			var facing = '';
			if(this.movingTile.facing=='right'){
				matrix.push({x:-1,y:1},
					{x:1,y:-1},
					{x:2,y:-2});
				facing = 'up';
			}else if(this.movingTile.facing=='up'){
				matrix.push({x:1,y:1},
					{x:-1,y:-1},
					{x:-2,y:-2});

				facing = 'left';
			}else if(this.movingTile.facing=='left'){
				matrix.push({x:1,y:-1},
					{x:-1,y:1},
					{x:2,y:2});

				facing = 'down';
			}else if(this.movingTile.facing=='down'){
				matrix.push({x:-1,y:-1},
					{x:1,y:1},
					{x:-2,y:2});
				facing = 'right';
			}

			var first = this.screenToTile(this.movingTile.getAt(0).x,this.movingTile.getAt(0).y);
			var last = this.screenToTile(this.movingTile.getAt(3).x,this.movingTile.getAt(3).y);
			first.x+=matrix[0].x;
			first.y+=matrix[0].y;
			last.x+=matrix[2].x;
			last.y+=matrix[2].y;
			if(this.isTileInIndex(first.x,first.y) || this.isTileInIndex(last.x,last.y)){
				canRotate = false;
			}
			if( first.x==this.limit.left || last.x==this.limit.left || first.x==this.limit.right || last.x==this.limit.right){
				canRotate=false;
			}
			if(first.y==this.limit.bottom || last.y==this.limit.bottom){
				canRotate=false;
			}

			if(canRotate){
				this.rotateWithTileCoord(this.movingTile.getAt(0),matrix[0].x,matrix[0].y);
				this.rotateWithTileCoord(this.movingTile.getAt(2),matrix[1].x,matrix[1].y);
				this.rotateWithTileCoord(this.movingTile.getAt(3),matrix[2].x,matrix[2].y);
				this.movingTile.facing = facing;
			}		
		}else if(this.movingTile.name=='T'){
			var matrix = [];
			var facing = '';
			if(this.movingTile.facing=='right'){
				matrix.push({x:-1,y:-1},
					{x:-1,y:1},
					{x:1,y:-1});
				facing = 'up';
			}else if(this.movingTile.facing=='up'){
				matrix.push({x:-1,y:1},
					{x:1,y:1},
					{x:-1,y:-1});
				facing = 'left';
			}else if(this.movingTile.facing=='left'){
				matrix.push({x:1,y:1},
					{x:1,y:-1},
					{x:-1,y:1});
				facing = 'down';
			}else if(this.movingTile.facing=='down'){
				matrix.push({x:1,y:-1},
					{x:-1,y:-1},
					{x:1,y:1});
				facing = 'right';
			}

			var first = this.screenToTile(this.movingTile.getAt(0).x,this.movingTile.getAt(0).y);
			var last = this.screenToTile(this.movingTile.getAt(3).x,this.movingTile.getAt(3).y);
			first.x+=matrix[0].x;
			first.y+=matrix[0].y;
			last.x+=matrix[2].x;
			last.y+=matrix[2].y;
			if(this.isTileInIndex(first.x,first.y) || this.isTileInIndex(last.x,last.y)){
				canRotate = false;
			}
			if( first.x==this.limit.left || last.x==this.limit.left || first.x==this.limit.right || last.x==this.limit.right){
				canRotate=false;
			}
			if(first.y==this.limit.bottom || last.y==this.limit.bottom){
				canRotate=false;
			}

			if(canRotate){
				this.rotateWithTileCoord(this.movingTile.getAt(0),matrix[0].x,matrix[0].y);
				this.rotateWithTileCoord(this.movingTile.getAt(1),matrix[1].x,matrix[1].y);
				this.rotateWithTileCoord(this.movingTile.getAt(3),matrix[2].x,matrix[2].y);
				this.movingTile.facing = facing;
			}
		}else if(this.movingTile.name=='Lrev'){
			var matrix = [];
			var facing = '';
			if(this.movingTile.facing=='right'){
				matrix.push({x:-1,y:1},
					{x:1,y:-1},
					{x:2,y:0});
				facing = 'up';
			}else if(this.movingTile.facing=='up'){
				matrix.push({x:1,y:1},
					{x:-1,y:-1},
					{x:0,y:-2});

				facing = 'left';
			}else if(this.movingTile.facing=='left'){
				matrix.push({x:1,y:-1},
					{x:-1,y:1},
					{x:-2,y:0});

				facing = 'down';
			}else if(this.movingTile.facing=='down'){
				matrix.push({x:-1,y:-1},
					{x:1,y:1},
					{x:0,y:2});
				facing = 'right';
			}

			var first = this.screenToTile(this.movingTile.getAt(0).x,this.movingTile.getAt(0).y);
			var last = this.screenToTile(this.movingTile.getAt(3).x,this.movingTile.getAt(3).y);
			first.x+=matrix[0].x;
			first.y+=matrix[0].y;
			last.x+=matrix[2].x;
			last.y+=matrix[2].y;
			if(this.isTileInIndex(first.x,first.y) || this.isTileInIndex(last.x,last.y)){
				canRotate = false;
			}
			if( first.x==this.limit.left || last.x==this.limit.left || first.x==this.limit.right || last.x==this.limit.right){
				canRotate=false;
			}
			if(first.y==this.limit.bottom || last.y==this.limit.bottom){
				canRotate=false;
			}

			if(canRotate){
				this.rotateWithTileCoord(this.movingTile.getAt(0),matrix[0].x,matrix[0].y);
				this.rotateWithTileCoord(this.movingTile.getAt(2),matrix[1].x,matrix[1].y);
				this.rotateWithTileCoord(this.movingTile.getAt(3),matrix[2].x,matrix[2].y);
				this.movingTile.facing = facing;
			}		
		}
	},

	rotateWithTileCoord : function(sprite,x,y){
		var c = this.screenToTile(sprite.x,sprite.y);
		c.x+=x;
		c.y+=y;
		var s = this.tileToScreen(c.x,c.y);
		sprite.x=s.x;
		sprite.y=s.y;
	},

	rowReady : function(){
		var removedRows = 0;
		var dropRowsFrom = 0;
		for(var row=0;row<this.limit.bottom;row++){
			var fullLine = true;
			for(var col=this.limit.left+1;col<this.limit.right;col++){
				if(!this.isTileInIndex(col,row)) fullLine = false;
			}
			if(fullLine){
				dropRowsFrom=row;
				removedRows++;				
				for(var i=0;i<this.standingTiles.length;i++){
					var g = this.standingTiles[i];
					var starting = this.limit.left+1;
					var toremove = [];
					var ind=0;
					while(starting<this.limit.right){
						g.forEach(function(child){
							var c = this.screenToTile(child.x,child.y);
							if(c.x==starting && c.y==row){
								child.kill();
								toremove.push(child);
							}
						},this);
						starting++;
					}
					while(toremove.length>ind){
						g.remove(toremove[ind]);
						ind++;
					}

				}
			}
		}

		if(removedRows>0){
			for(var i=0;i<this.standingTiles.length;i++){
				var g = this.standingTiles[i];
				g.forEach(function(child){
					var c = this.screenToTile(child.x,child.y);				
					if(c.y<dropRowsFrom){
						var ts = this.tileToScreen(0,removedRows);
						child.y+=ts.y;
					}
				},this);
			}

			if(removedRows>2){
				this.score+=250*removedRows;	
			}else if(removedRows==2){
				this.score+=150*removedRows;
			}else{
				this.score+=100;
			}
			
			this.scoreText.text = ''+this.score;
			this.totalRemovedRows+=removedRows;
		}

		if(this.totalRemovedRows>15){
			this.totalRemovedRows=0;
			this.level++;
			this.levelText.text = ''+this.level;
			if(this.moveTileTimeStep>200){
				this.moveTileTimeStep-=100;	
			}			
		}
	}
};
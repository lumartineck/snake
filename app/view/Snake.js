/**
 * By Luis Enrique Mart&iacute;nez
 * Snake game
 * @class MyApp.view.Snake
 * @extends Ext.draw.Component
 * @autor LCC Luis Enrique Mart&iacute;nez G&oacute;mez<br>
 *        lumartineck@gmail.com<br>
 * @fecha Septiembre, 2012. M&eacute;xico DF
 */
Ext.define('MyApp.view.Snake', {
    /**
     * @cfg {String} extend
     * The parent class that this class extends. For example:
     */
    extend:'Ext.draw.Component',
    /**
     * @cfg {String[]} alias
     * @member Ext.Class
     * List of short aliases for class names.  Most useful for defining xtypes for widget.
     */
    alias:'widget.snake',
    /**
     * @cfg {String/Object} style
     * A custom style specification to be applied to this component's Element. Should be a valid argument to
     * {@link Ext.Element#applyStyles}.
     */
    style:{
        backgroundImage:"url('resources/images/back.jpeg')"
    },
    /**
     * @cfg {Number} width
     * The width of this component in pixels.
     */
    width:700,
    /**
     * @cfg {Number} height
     * The height of this component in pixels.
     */
    height:440,
    /**
     * @cfg {Boolean} mute
     * Not emmiting any sound in the game.
     */
    mute:0,
    /**
     * @cfg {Number} spriteWidth
     * The width of the body snake.
     */
    spriteWidth:20,
    /**
     * @cfg {Number} spriteHeight
     * The height of the body snake.
     */
    spriteHeight:10,
    /**
     * @cfg {Boolean} gameOver
     * Flag to indicates game over.
     */
    gameOver:0,
    /**
     * @cfg {String} direction
     * The direction of the snake movement.
     */
    direction:"down",
    /**
     * @cfg {Number} score
     * The score of the game.
     */
    score:0,
    /**
     * @cfg {Ext.util.TaskRunner} runner
     * Provides the ability to execute one or more arbitrary tasks in a asynchronous manner.
     */
    runner:new Ext.util.TaskRunner(),
    /**
     * Fires after the component rendering is finished.
     */
    afterRender:function () {
        this.scrawlSound = new Audio("resources/sounds/scrawl.mp3"); //buffering sounds
        this.eatSound = new Audio("resources/sounds/eat.mp3");
        //Create the initial configurations
        this.createSnake();
        this.createFood();
        this.createMovement();
        this.createKeyNavigation();

        this.callParent(arguments);
    },
    /**
     * Create the body of the snake and draw in the game surface.
     */
    createSnake:function () {
        var length = 5; //length of the body snake
        this.snakeArray = []; //Empty array to start
        for (var i = length - 1; i >= 0; i--) {
            var sprite = new Ext.draw.Sprite({ //Create the rectangles for the body
                type:'rect',
                width:this.spriteWidth,
                height:this.spriteHeight,
                opacity:0.55,
                fill:'black',
                stroke:'orange',
                'stroke-width':2
            });
            this.surface.add(sprite);
            sprite.setAttributes({ //This will create a horizontal snake starting from the top left
                y:0,
                x:i == 0 ? i : i * this.spriteWidth
            }, true);

            this.snakeArray.push(sprite); //Add rectangles to the snake array
        }
    },
    /**
     * Create the food for the snake in the drawinf area.
     */
    createFood:function () {
        var fx = 0, //Coordinate x for the food
            fy = 0; //Coordinate y for the food
        do
        { //Create a valid coordinates for the food
            fy = Math.round((this.height - this.spriteHeight) * Math.random());
            fx = Math.round((this.width - this.spriteWidth) * Math.random());
        }
        while ((fy % this.spriteHeight) != 0 || (fx % this.spriteWidth) != 0);

        this.food = new Ext.draw.Sprite({ //The rectangle that represents the food
            type:'rect',
            width:this.spriteWidth,
            height:this.spriteHeight,
            opacity:0.55,
            fill:'black',
            stroke:'red',
            'stroke-width':2
        });
        this.surface.add(this.food);
        this.food.setAttributes({ //Draw the food with valid coordinates
            x:fx,
            y:fy
        }, true);
    },
    /**
     * Create the movement of the snake.
     */
    createMovement:function () {
        var _this = this; //Local reference to the scope

        _this.task = _this.runner.newTask({ //Create a task
            run:function () {
                var newCoordinates = [], //New coordinates for the head snake
                    nx = _this.snakeArray[0].attr.x, //The coordinates for the snake head
                    ny = _this.snakeArray[0].attr.y,
                    sprite = new Ext.draw.Sprite({ //The new snake head
                        type:'rect',
                        width:_this.spriteWidth,
                        height:_this.spriteHeight,
                        opacity:0.55,
                        fill:'black',
                        stroke:'orange',
                        'stroke-width':2
                    });
                if (!_this.mute) { //If sound is permitted
                    _this.scrawlSound.play();
                }

                newCoordinates = _this.createNewCoordinates(nx, ny); //create new coordinates

                nx = newCoordinates[0]; //Update the new coordinates.
                ny = newCoordinates[1];

                if (_this.checkCollision(nx, ny, _this.snakeArray)) { //If collision itself
                    _this.onGameOver();
                }

                _this.surface.add(sprite);
                sprite.setAttributes({ //Draw the new head with the new coordinates
                    y:ny,
                    x:nx
                }, true);

                _this.snakeArray.unshift(sprite); //Add the new head to the array

                if (_this.food.attr.x == nx && _this.food.attr.y == ny) { //If the new coordinates are equals to the food coordinates
                    if (!_this.mute) { //If sound is permitted
                        _this.eatSound.play();
                    }
                    _this.food.remove(); //Remove the food rectangle
                    _this.task.interval = _this.task.interval - 10; //Decrement the task interval
                    _this.createFood(); //Create new food
                    _this.score = _this.score + 10; //Increment score
                    _this.fireEvent('updatescore', _this.score); //Fire event to update the score
                } else {
                    _this.snakeArray[_this.snakeArray.length - 1].remove(); //Remove the last rectangle body of the snake
                    _this.snakeArray.pop(); //Remove the last element of snake array
                }
            },
            interval:200 //The interval to loop the task
        });
    },
    /**
     * Start or restart the game
     */
    initMovement:function () {
        if (this.gameOver) {
            this.restartGame();
        }
        this.task.start();
        this.el.unmask();
    },
    /**
     * Pause the game
     */
    pauseMovement:function () {
        this.el.mask('Paused ...');
        this.scrawlSound.pause();
        this.task.stop();
    },
    /**
     * Change the permision of the sound
     */
    muteSound:function () {
        this.mute = !this.mute;
    },
    /**
     * Change the direction to up
     */
    moveUp:function () {
        this.direction = (this.direction == "down" || this.direction == "up") ? this.direction : "up";
    },
    /**
     * Change the direction to down
     */
    moveDown:function () {
        this.direction = (this.direction == "down" || this.direction == "up") ? this.direction : "down";
    },
    /**
     * Change the direction to left
     */
    moveLeft:function () {
        this.direction = (this.direction == "left" || this.direction == "right") ? this.direction : "left";
    },
    /**
     * Change the direction to right
     */
    moveRight:function () {
        this.direction = (this.direction == "left" || this.direction == "right") ? this.direction : "right";
    },
    /**
     * Creates the key navigation
     */
    createKeyNavigation:function () {
        Ext.create('Ext.util.KeyNav', Ext.getDoc(), {
            scope:this,
            up:this.moveUp,
            down:this.moveDown,
            left:this.moveLeft,
            right:this.moveRight,
            space:this.initMovement
        });
    },
    /**
     * Check if the coordinates given collision with an element of the array
     * @param {Number} x
     * @param {Number} y
     * @param {Array} array
     * @return {Boolean}
     */
    checkCollision:function (x, y, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].attr.x == x && array[i].attr.y == y)
                return true;
        }
        return false;
    },
    /**
     * Creates a coordinate with the logic of snake game
     * @param nx
     * @param ny
     * @return {Array}
     */
    createNewCoordinates:function (nx, ny) {
        if (this.direction == "right") { //If the snake movement is right
            if (nx == this.width) { //And "x" coordinate is equals to the width drawing surface
                nx = 0; //The "x" coordinate start in the left with 0
            } else {
                nx = nx + this.spriteWidth; //Increment the "x" coordinate with the spriteWidth
            }
        } else if (this.direction == "left") { //If the snake movement is left
            if (nx == -this.spriteWidth) { //And "x" coordinate is equals to the "- spriteWidth"
                nx = this.width - this.spriteWidth; //The "x" coordinate start in the right surface area
            } else {
                nx = nx - this.spriteWidth; //Increment the "x" coordinate with the spriteWidth
            }
        } else if (this.direction == "up") { //If the snake movement is up
            if (ny == -this.spriteHeight) { //And "y" coordinate is equals to the "- spriteHeight"
                ny = this.height - this.spriteHeight; //The "y" coordinate start in the down surface area
            } else {
                ny = ny - this.spriteHeight; //Decrement the "y" coordinate with the spriteHeight
            }
        } else if (this.direction == "down") { //If the snake movement is udown
            if (ny == this.height) { //And "y" coordinate is equals to the height surface
                ny = 0; //The "y" coordinate start in the up surface area
            } else {
                ny = ny + this.spriteHeight; //Increment the "y" coordinate with spriteHeight
            }
        }
        return [nx, ny]; //Return coordinates
    },
    /**
     * Stop the task and change the flag gameOver
     */
    onGameOver:function () {
        this.el.mask('Game Over :( ...'); //Mask the game with the leyend "
        this.scrawlSound.pause();
        this.task.stop();
        this.gameOver = !this.gameOver;
    },
    /**
     * Process to restart the game
     */
    restartGame:function () {
        this.surface.removeAll(); //Remove all elements in the surface
        this.createSnake(); //Create a new snake
        this.createFood(); //Create a food for the snake
        this.direction = "down";
        this.task.interval = 200; //Restart the task interval
        this.score = 0; //Reset the score
        this.fireEvent('updatescore', this.score); //Update the score
        this.gameOver = !this.gameOver; //Change the flag
    }

});
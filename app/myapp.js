/**
 * By Luis Enrique Mart&iacute;nez
 * Snake game
 * @autor LCC Luis Enrique Mart&iacute;nez G&oacute;mez<br>
 *        lumartineck@gmail.com<br>
 * @fecha Septiembre, 2012. M&eacute;xico DF
 */

/**
 * Set the configuration for the loader. This should be called right after ext-(debug).js
 * is included in the page, and before Ext.onReady.
 */
Ext.Loader.setConfig({
    enabled:true
});
/**
 * Loads Ext.app.Application class and starts it up with given configuration after the page is ready.
 */
Ext.application({
    /**
     * @cfg {String} name
     * The name of your application. This will also be the namespace for your views, controllers
     * models and stores. Don't use spaces or special characters in the name.
     */
    name:'MyApp',
    /**
     * @cfg {String[]} requires
     * List of classes that have to be loaded before instantiating this class.
     */
    requires:['MyApp.view.Snake'],
    /**
     * @method
     * @template
     * Called automatically when the page has completely loaded.
     */
    launch:function () {
        var gameSurface = Ext.create('MyApp.view.Snake', { //Surface of the game
            listeners:{
                'updatescore':Ext.bind(this.updateScore, this) //Event to update the score
            }
        });
        Ext.create('Ext.Window', {
            title:'Snake',
            frame:false,
            resizable:false,
            layout:'fit',
            items:[gameSurface],
            bbar:['<b>SNAKE</b>', //Title of the game
                '-',
                {id:'text'+this.id,text:'Score: 0'}, //Score text
                '->', {
                iconCls:'play', //Button play
                scale:'large',
                handler:function () {
                    gameSurface.initMovement();
                }
            }, {
                iconCls:'pause', //Button pause
                scale:'large',
                handler:function () {
                    gameSurface.pauseMovement();
                }
            }, {
                iconCls:'mute', //Button mute
                scale:'large',
                handler:function () {
                    gameSurface.muteSound();
                }
            }]
        }).show();
    },
    /**
     * Updates the score text
     * @param {Number} score
     */
    updateScore:function(score){
        Ext.getCmp('text'+this.id).update("Score: <b>"+score+"</b>");
    }
});
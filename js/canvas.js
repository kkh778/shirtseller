var sessionid;
var fonts = [];
var design_clipart = [];
var design_text = [];
var design_colors = [];
var activeObj = null;
var getBeforeObj = null;

var removeobj = 0;
var isSelectedColor = false;
var selectedColorlayer = 0;
var isSelectClipObj = 0;
var placementObj = null;
var graytlx = 0;
var graytly = 0;
var graywidth = 0;
var grayheight = 0;
var lpos = 0;
var tpos = 0;
var gwidth = 0;
var gheight = 0;

jQuery(document).ready(function() {

    var p_flag = 0;
    var isaddtext = 0;
        
    $('#placement').click();
    $('.secondp').hide();
    $(".tabcontent").children().hide();
    $(".tabcontent").children().first().show();
    $('.colortab_custom').hide();

    p_flag = 0;
    isaddtext = 0;
    $('.tab_custom').height($('.colortab_custom').height());
    $('.tab_custom').css({
        "padding-right":"0px",
        "padding-left":"0px",
        "overflow":"auto"
    });

    var acc = document.getElementsByClassName("accordion");
    acc[0].classList.toggle("active");
    acc[0].nextElementSibling.classList.toggle("show");    
    
    for (var i = 0; i < acc.length; i++) {
        acc[i].onmousedown = function() {
            $('.tab_custom').height();
            $('.secondp').find('.accordion').removeClass('active');
            $('.secondp').find('.panel').removeClass('show');
            this.classList.toggle("active");
            
            this.nextElementSibling.classList.toggle("show");
        }
    }

    login();
});


function login() {
    var xml = '<request><clientname>Sparkly Tees</clientname><sitekey>C7488241-3948-4827-BF7C-86D8A63AC51F</sitekey></request>';

    $.ajax({
        type: "POST",
        url: url + "/Site.svc/SiteLogin",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($.xml2json(xml)),
        dataType: "json",
        success: function(response) {
            var r = response.SiteLoginResult;
            if (r.isSuccessful == false) {
                alert(r.ErrorDescription + "(" + r.ErrorNumber + ")")
            } else {
                sessionid = r.SessionID;
                listFonts();
                listClipArt();
                getColorPalette();
                listPlacement();

                var mycanvas = document.getElementById('myCanvas');
                var myctx = mycanvas.getContext('2d');
                
                drawGrid();
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            alert(xhr.responseText + ' - ' + xhr.error + ' - ' + thrownError);
        }
    });
}

function getFont(fontid) {
    var xml = "<request><sessionid>" + sessionid + "</sessionid><fontid>" + fontid + "</fontid></request>";
    $.ajax({
        type: "POST",
        url: url + "/Site.svc/FontGet",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($.xml2json(xml)),
        dataType: "json",
        success: function(response) {
            var r = response.FontGetResult;
            if (r.isSuccessful == false) {
                alert(r.ErrorDescription + "(" + r.ErrorNumber + ")");
                return;
            } else {
                fonts[fontid] = eval(r.Data)[0];
                // console.log(fonts);
                // document.getElementById('tbx').focus();
            }
        }
    });
}

// Convert from data array to canvas object.
function getCanvasObjects(data_array) {
    var log     = false;
    var width   = 0;
    var height  = 0;
    var gap     = 10;
    var x       = 0;
    var y       = 0;
    var baseline = 0;
    
    for (var i = 0; i < data_array.length; i++) {
        var c = data_array[i];
        if (x == 0) {
            x = c.Width / 2;
        }
        if (c.Height > height) {
            height = c.Height;
        }   
        width += c.Width;
        width += gap;
    }

    width -= gap;
   
    height = c.Height;   

    y = c.Height / 2;
   
    
    

    // If data is clipart, y equal height / 2. If data is text, y equals height.
    // if (data_array.length == 1) {
        // y = height / 2;    
    // } else {
        
        
        // height = 1100;
    // }
    

    // console.log(data_array);
    var cTemp = document.createElement('canvas');

    cTemp.width  = width;
    cTemp.height = height;
    var ctx = cTemp.getContext('2d');
    for (var da = 0; da < data_array.length; da++) {
        var data = data_array[da];
        for (var i = 0; i < data.Groups.length; i++) {
            var g = data.Groups[i];
            for (var j = 0; j < g.Paths.length; j++) {
                var p = g.Paths[j];
                var a = eval(p.Command);
                if (log) console.log(p.Command);
                switch (a[0]) {
                    case 'BP':
                        ctx.beginPath();
                        if (log) console.log('ctx.beginPath();');
                        break;
                    case 'MT':
                        ctx.moveTo((x + a[1]), (y + a[2]));
                        if (log) console.log('ctx.moveTo(' + (x + a[1]) + ',' + (y + a[2]) + ');');
                        break;
                    case 'LT':
                        ctx.lineTo((x + a[1]), (y + a[2]));
                        if (log) console.log('ctx.lineTo(' + (x + a[1]) + ',' + (y + a[2]) + ');');
                        break;
                    case 'BCT':
                        ctx.bezierCurveTo((x + a[1]), (y + a[2]), (x + a[3]), (y + a[4]), (x + a[5]), (y + a[6]));
                        if (log) console.log('ctx.bezierCurveTo(' + (x + a[1]) + ',' + (y + a[2]) + ',' + (x + a[3]) + ',' + (y + a[4]) + ',' + (x + a[5]) + ',' + (y + a[6]) + ');');
                        break;
                    case 'CP':
                        ctx.closePath();
                        if (log) console.log('ctx.closePath();');
                        break;
                }
            }

            if (g.Fill !== undefined) {
                // console.log(g.Fill);
                // console.log(g.Fill.HtmlColor);

                if ( g.Fill.HtmlColor.indexOf('img_pattern') != -1) {
                    var image = document.getElementById(g.Fill.HtmlColor);
                    ctx.fillStyle = ctx.createPattern(image, "repeat");
                } else { 
                    ctx.fillStyle = g.Fill.HtmlColor.replace(new RegExp("'", 'g'), "");
                }

                ctx.mozFillRule = 'evenodd';
                ctx.fill('evenodd');
                if (log) {
                    console.log('ctx.fillStyle = ' + g.Fill.HtmlColor + ';');
                    console.log('ctx.mozFillRule = \'evenodd\';');
                    console.log('ctx.fill(\'evenodd\');');
                }
            }

            if (g.Stroke != undefined) {
                ctx.strokeStyle = g.Stroke.HtmlColor;
                ctx.lineWidth   = g.StrokeWidth;
                ctx.stroke();
                if (log) {
                    console.log('ctx.strokeStyle = ' + g.Stroke.HtmlColor + ';');
                    console.log('ctx.lineWidth = '   + g.StrokeWidth      + ';');
                    console.log('ctx.stroke();');
                }
            }
        }
        x += ((data.Width / 2) + gap);
        if (da + 1 < data_array.length)
            x += (data_array[da + 1].Width / 2);
    }

    return (cTemp);
}


function getCanvasObjects_font(data_array) {
    var log     = false;
    var width   = 0;
    var height  = 0;
    var gap     = 10;
    var x       = 0;
    var y       = 0;
    var baseline = 0;
    
    for (var i = 0; i < data_array.length; i++) {
        var c = data_array[i];
        if (x == 0) {
            x = c.Width / 2;
        }
        if (c.Height > height) {
            height = c.Height;
        }
        width += c.Width;
        width += gap;
    }
    width -= gap;
    
        height = c.Height + 200;

        y = c.Height;
    
    
    

    // If data is clipart, y equal height / 2. If data is text, y equals height.
    // if (data_array.length == 1) {
        // y = height / 2;    
    // } else {
        
        
        // height = 1100;
    // }
    

    // console.log(data_array);
    var cTemp = document.createElement('canvas');



    cTemp.width  = width;
    cTemp.height = height;
    var ctx = cTemp.getContext('2d');
    for (var da = 0; da < data_array.length; da++) {
        var data = data_array[da];
        for (var i = 0; i < data.Groups.length; i++) {
            var g = data.Groups[i];
            for (var j = 0; j < g.Paths.length; j++) {
                var p = g.Paths[j];
                var a = eval(p.Command);
                if (log) console.log(p.Command);
                switch (a[0]) {
                    case 'BP':
                        ctx.beginPath();
                        if (log) console.log('ctx.beginPath();');
                        break;
                    case 'MT':
                        ctx.moveTo((x + a[1]), (y + a[2]));
                        if (log) console.log('ctx.moveTo(' + (x + a[1]) + ',' + (y + a[2]) + ');');
                        break;
                    case 'LT':
                        ctx.lineTo((x + a[1]), (y + a[2]));
                        if (log) console.log('ctx.lineTo(' + (x + a[1]) + ',' + (y + a[2]) + ');');
                        break;
                    case 'BCT':
                        ctx.bezierCurveTo((x + a[1]), (y + a[2]), (x + a[3]), (y + a[4]), (x + a[5]), (y + a[6]));
                        if (log) console.log('ctx.bezierCurveTo(' + (x + a[1]) + ',' + (y + a[2]) + ',' + (x + a[3]) + ',' + (y + a[4]) + ',' + (x + a[5]) + ',' + (y + a[6]) + ');');
                        break;
                    case 'CP':
                        ctx.closePath();
                        if (log) console.log('ctx.closePath();');
                        break;
                }
            }

            if (g.Fill !== undefined) {
                // console.log(g.Fill);
                // console.log(g.Fill.HtmlColor);

                if ( g.Fill.HtmlColor.indexOf('img_pattern') != -1) {
                    var image = document.getElementById(g.Fill.HtmlColor);
                    ctx.fillStyle = ctx.createPattern(image, "repeat");
                } else { 
                    ctx.fillStyle = g.Fill.HtmlColor.replace(new RegExp("'", 'g'), "");
                }

                ctx.mozFillRule = 'evenodd';
                ctx.fill('evenodd');
                if (log) {
                    console.log('ctx.fillStyle = ' + g.Fill.HtmlColor + ';');
                    console.log('ctx.mozFillRule = \'evenodd\';');
                    console.log('ctx.fill(\'evenodd\');');
                }
            }

            if (g.Stroke != undefined) {
                ctx.strokeStyle = g.Stroke.HtmlColor;
                ctx.lineWidth   = g.StrokeWidth;
                ctx.stroke();
                if (log) {
                    console.log('ctx.strokeStyle = ' + g.Stroke.HtmlColor + ';');
                    console.log('ctx.lineWidth = '   + g.StrokeWidth      + ';');
                    console.log('ctx.stroke();');
                }
            }
        }
        x += ((data.Width / 2) + gap);
        if (da + 1 < data_array.length)
            x += (data_array[da + 1].Width / 2);
    }


    return (cTemp);
}
/*function getCharacters(fontid, characters) {
    // console.log("getCharacters, FontID:" + fontid);
    // console.log(fonts);
    var cliparts = [];
    for (var i = 0; i < characters.length; i ++) {
        for (var j = 0; j < fonts[fontid].Characters.length; j++) {
            var c = fonts[fontid].Characters[j];
            if (c.Character == characters[i]) {
                cliparts.push(c.CanvasObject);
                // console.log("getCharacters, c.CanvasObject.ID:" + c.CanvasObject.ID);
                break;
            }
        }
    }
        
    return (getCanvasObjects(cliparts));
}*/

function getCharacters(fontid, characters) {
    var cliparts    = [];
    var spacing     = 0;
    var stretch     = 1;
    var left        = canvas.width / 2;
    var height      = 0;

    for (var i = 0; i < characters.length; i++) {
        for (var j = 0; j < fonts[fontid].Characters.length; j++) {
            var c = fonts[fontid].Characters[j];
            if (c.Character == characters[i]) {
                // console.log(c.Character + ':' + c.CanvasObject.Height)
                if (c.CanvasObject.Height > height) {
                    height = c.CanvasObject.Height;
                }

                cliparts.push(new fabric.Image(getCanvasObjects_font([c.CanvasObject]), {                   
                    left    : left,
                    top     : canvas.height / 2,
                    originX : 'left',
                    originY : 'bottom',
                    // width: c.CanvasObject.Width
                    // height: c.CanvasObject.Height
                    // stroke: 'red',
                    // strokeWidth: 10
                }));
                // console.log("getCharacters, c.CanvasObject.ID:" + c.CanvasObject.ID);
                left += c.CanvasObject.Width + spacing;
                break;
            }
        }
    }
    
    var grp = new fabric.Group(cliparts, {
        left: canvas.width / 2,
        top: canvas.height / 2,
    });

    return  grp;
}

function _render(source) {
    var left = source.left;
    var top = source.top;
    var scaleX = source.getScaleX();
    var scaleY = source.getScaleY();

    // Make a arced text.
    /*var radius  = 4000;
    var arc     = 10;
    var reverse = false;
    var align   = 'center';
    var arclength = 0;

    if ( align === 'center' ) {
        align = ( arc / 2) * ( source.size() - 1) ;
    } else if ( align === 'right' ) {
        align = ( arc ) * ( source.size() - 1) ;
    }

    for ( var i = 0; i < source.size(); i ++) {
        // Find coords of each letters (radians : angle*(Math.PI / 180)
        if ( reverse ) {
            curAngle = (-i * parseInt( arc, 10 )) + align;
            angleRadians = curAngle * (Math.PI / 180);
            source.item(i).set( 'top', (Math.cos( angleRadians ) * radius));
            source.item(i).set( 'left', (-Math.sin( angleRadians ) * radius) );
        } else {
            curAngle = (i * parseInt( arc, 10)) - align;
            angleRadians = curAngle * (Math.PI / 180);
            source.item(i).set( 'top', (-Math.cos( angleRadians ) * radius) );
            source.item(i).set( 'left', (Math.sin( angleRadians ) * radius) );
        }

        source.item(i).setAngle( curAngle );
    }
    */
    // Update group coords
    source._calcBounds();
    source._updateObjectsCoords();
    source.top = top;
    source.left = left;
    source.saveCoords();
    
    source.setScaleX(scaleX);
    source.setScaleY(scaleY);
    
    canvas.renderAll();
}

function drawCharacters(fontid, $that, x, y) {
    var characters = $that.val();
    if (characters.length == 0)
        return;

    var id      = design_text.length;

    var item    = getCharacters(fontid, characters);
    
    item.set('id', id);
    item.set('objType', 'text');

    item.scale(0.1);
    item.sizelock = false;
    _render(item);
    canvas.add(item);
    
    // preview image

    //canvas.setActiveObject(item);
    // object layer
    $('#clipart_layer').find('li.active').removeClass('active');
    $('#clipart_layer').prepend('<li class="active" data-id="text_' + id + '"><a data-href="#"><img width="35" height="35" style="border-color:1px solid gray" id="text_' + id + '"></a></li>');
    $('#clipart_layer').find('#text_' + id).attr('src', item.toDataURL('png'));
    // active clipart object.
    selectTextObj(item);
    design_text.push(item);
}


function updateCharacters(group, options)
{

}

function listFonts() {
    var xml = "<request><sessionid>" + sessionid + "</sessionid></request>";

    $.ajax({
        type: "POST",
        url: url + "/Site.svc/FontList",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($.xml2json(xml)),
        dataType: "json",
        success: function(response) {
            var r = response.FontListResult;
            if (r.isSuccessful == false) {
                alert(r.ErrorDescription + "(" + r.ErrorNumber + ")");
                return;
            } else {
                var data = eval(r.Data);
                for (var i = 0; i < data.length; i++) {
                    var f = data[i];
                    $('#ddlFonts').append($('<option>', {
                        value: f.ID,
                        text: f.Name
                    }));
                    $('#ddlFonts_form').append($('<option>', {
                        value: f.ID,
                        text: f.Name
                    }));
                    getFont(f.ID);
                }
            }
        }
    });
}

function listClipArt() {
    var xml = "<request><sessionid>" + sessionid + "</sessionid></request>";
    $.ajax({
        type: "POST",
        url: url + "/Site.svc/ClipArtList",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($.xml2json(xml)),
        dataType: "json",
        success: function(response) {
            var r = response.ClipArtListResult;
            if (r.isSuccessful == false) {
                alert(r.ErrorDescription + "(" + r.ErrorNumber + ")");
                return;
            } else {
                var data = eval(r.Data);
                for (var i = 0; i < data.length; i++) {
                    var c = data[i];
                    $('#ddlClipArt').append($('<option>', {
                        value: c.ID,
                        text: c.Name
                    }));
                    $('#listClipArt').append($('<li>', {
                        id: c.ID,
                        html: c.Name
                    }));
                    
                }
            }
        }
    });
}

function listPlacement() {
    var xml = "<request><sessionid>" + sessionid + "</sessionid></request>";
    $.ajax({
        type: "POST",
        url: url + "/Site.svc/PlacementList",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($.xml2json(xml)),
        dataType: "json",
        success: function (response) {
            var r = response.PlacementListResult;
            if (r.isSuccessful == false) {
                alert(r.ErrorDescription + "(" + r.ErrorNumber + ")");
                return;
            } else {
                var data = eval(r.Data);
                for (var i = 0; i < data.length; i++) {
                    var p = data[i];
                     // console.log(p);
                     // console.log('[' + p.Width + ',' + p.Height + '] - ' + p.Overlap);
                     $(".placement-modal .modal-body").append("<div style='float:left;'><IMG src='http://api.thetshirtguylv.com/image/placement/" + p.PreviewImage + "' data-width='"+p.Width+"' data-height='"+p.Height+"'/><br><p align='center'>" + p.Name + "</p></div>");
                }
            }
        }
    });
}

// Update Object's color.
function updateObjColor() {
    // Get selected Object.
    var selectedObj = canvas.getActiveObject();

    if (selectedObj == null ) {
        alert('Please select a clipart.');
        return;
    }

    var selectedObjId = selectedObj.id;
    var ca = design_clipart[selectedObjId];
    var source   = getCanvasObjects([ca.CanvasObject]);
    // Add mix colored Object.
    var item = new fabric.Image(getCanvasObjects([ca.CanvasObject]), {        
        left:   selectedObj.left,
        top:    selectedObj.top,
        width:  selectedObj.getWidth(),
        height: selectedObj.getHeight(),
        angle:  selectedObj.getAngle(),
        // opacity : 0.5,
        originX: 'center',
        originY: 'center'
    });
    // item.scale(0.2);

    item.set('id', selectedObjId);
    item.set('objType', 'image');
    canvas.add(item);
   
    // Remove selected Object.
    canvas.remove(selectedObj);

    // Set active new object.
    canvas.setActiveObject(item);

    // Update object layer's image.
    var cid = 'image_' + selectedObjId;
    $('#clipart_layer').find("[data-id='" + cid + "']").attr('src', item.toDataURL('png'));
                    
    var mycanvas = document.getElementById(cid);
    var myctx    = mycanvas.getContext('2d');

    myctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, 35, 35);
}

function drawClipArt(clipartid, x, y) {
    var xml = "<request><sessionid>" + sessionid + "</sessionid><clipartid>" + clipartid + "</clipartid></request>";
    
    $.ajax({
        type: "POST",
        url: url + "/Site.svc/ClipArtGet",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($.xml2json(xml)),
        dataType: "json",
        success: function(response) {
            var r = response.ClipArtGetResult;

            if (r.isSuccessful == false) {
                alert(r.ErrorDescription + "(" + r.ErrorNumber + ")");
                return;
            } else {
                var ca = eval(r.Data)[0];

                // console.log(ca);
                // console.log(ca.LockSize);

                design_colors = [];
                for (var i = 0; i < ca.CanvasObject.Colors.length; i++) {
                    var isFound = false;
                    for (var j = 0; j < design_colors.length; j++) {
                        if (ca.CanvasObject.Colors[i].ID == design_colors[j].ID) {
                            ca.CanvasObject.Colors[i] = design_colors[j];
                            isFound = true;
                            break;
                        }
                    }

                    if (isFound == false) {
                        design_colors[design_colors.length] = ca.CanvasObject.Colors[i];
                        ca.CanvasObject.Colors[i] = design_colors[design_colors.length - 1];
                    }
                }

                // Set Group Colors to design_color array //
                for (var i = 0; i < ca.CanvasObject.Groups.length; i++) {
                    for (var j = 0; j < design_colors.length; j++) {
                        if (ca.CanvasObject.Groups[i].Fill.HtmlColor == design_colors[j].HtmlColor) {
                            ca.CanvasObject.Groups[i].Fill = design_colors[j];
                        }
                    }
                }

                var id = design_clipart.length; 
                var cid = 'image_' + id;
                $('#clipart_layer').find('li.active').removeClass('active');
                $('#clipart_layer').prepend('<li class="active" data-id="' + cid + '"><a data-href="#home"><canvas width="35" height="35" style="border-color:1px solid gray" id="' + cid + '"></canvas></a></li>');
                
                var source   = getCanvasObjects([ca.CanvasObject]);
                var mycanvas = document.getElementById(cid);
                var myctx    = mycanvas.getContext('2d');

                var newWidth  = source.width    / 2;
                var newHeight = source.height   / 2;
                var positionX = x - (newWidth   / 2);
                var positionY = y - (newHeight  / 2);

                myctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, 35, 35);
                
                // console.log('source.width='+source.width+','+ 'source.height'+source.height+','+ 'positionX='+','+positionX +'positionY'+positionY+','+ 'newWidth'+newWidth+',' +'newHeight'+newHeight);
                
                var h = 200 * source.height / source.width;
                
                var item = new fabric.Image(source, {                     
                    left: canvas.width /2,
                    top:  canvas.height/2,
                    width: 200,
                    height: h,
                    sizelock: 'false',
                    // opacity : 0.5
                    originX: 'center',
                    originY: 'center'
                });

                
                item.sizelock = ca.LockSize;
                
                item.set('id', id);
                item.set('objType', 'image');

                canvas.add(item);
                
                canvas.setActiveObject(item);
                activeObj = item;
                
                

                ca.design_colors = design_colors;
                design_clipart.push(ca);

                var html = '';
                // Set values in html elements.

                for (var i = 0; i < ca.CanvasObject.Colors.length; i ++) {
                    html += '<a class="btn btn-default colorpicker selectcolor" data-id="' + i 
                         + '" style="background-color: ' 
                         + ca.CanvasObject.Colors[i].HtmlColor 
                         + '"></a>';
                }   
                $('#colorlayer').html(html);

                $('#clipart_width_text,  #clipart_width_range').val( parseFloat(item.getWidth()) );
                $('#clipart_height_text, #clipart_height_range').val( parseFloat(item.getHeight()));
                $('#clipart_angle_text,  #clipart_angle_range').val( item.getAngle());

                // active clipart object.
                selectClipartObj(item);
            }
        }
    });
}


function drawGrid() {
    var gridWidth  = canvas.width;  // <= you must define this with final grid width
    var gridHeight = canvas.height; // <= you must define this with final grid height

    var groupArray = [];
    // to manipulate grid after creation

    var gridSize = 20; // define grid size

    // define presentation option of grid
    var lineOption = {stroke: '#eee', strokeWidth: 1, selectable:false, strokeDashArray: [0, 0]};

    // do in two steps to limit the calculations
    // first loop for vertical line
    for(var i = Math.ceil(gridWidth / gridSize); i--;) {
        groupArray.push(new fabric.Line([gridSize*i, 0, gridSize*i, gridHeight], lineOption) );
    }
    // second loop for horizontal line
    for(var i = Math.ceil(gridHeight / gridSize); i--;) {
        groupArray.push(new fabric.Line([0, gridSize*i, gridWidth, gridSize*i], lineOption) );
    }

    // Group add to canvas
    var oGridGroup = new fabric.Group(groupArray, {
        left: 0, 
        top: 0, 
        originX: 'left', 
        originY: 'top', 
        selectable:false, 
        hoverCursor:'pointer'
    });
    canvas.add(oGridGroup);
}
function drawGrayGrid(w, h){
    w =w*55;
    h =h*55;
    var gridlp  = canvas.width/2-w/2;  // <= you must define this with final grid width
    var gridtp = canvas.height/2-h/2; // <= you must define this with final grid height
    graytlx = gridlp;
    graytly = gridtp;
    graywidth = w;
    grayheight = h;
    var groupArray = [];
    // to manipulate grid after creation

    var gridSize = 20; // define grid size

    // define presentation option of grid
    var lineOption = {stroke: '#fff', strokeWidth: 1, selectable:false, strokeDashArray: [0, 0]};

    // do in two steps to limit the calculations
    // first loop for vertical line
    for(var i = Math.ceil(w / gridSize); i--;) {
        groupArray.push(new fabric.Line([gridSize*i, 0, gridSize*i, h], lineOption) );
    }
    // second loop for horizontal line
    for(var i = Math.ceil(h / gridSize); i--;) {
        groupArray.push(new fabric.Line([0, gridSize*i, w, gridSize*i], lineOption) );
    }

    // Group add to canvas
    var rect = new fabric.Rect({
    left: gridlp,
    top: gridtp,
    originX: 'left', 
    originY: 'top', 
    width: w,
    height: h,
    fill: '#eee',
    selectable:false, 
    hoverCursor:'pointer'
  });
    var nGridGroup = new fabric.Group(groupArray, {
        left: gridlp, 
        top: gridtp, 
        originX: 'left', 
        originY: 'top', 
        selectable:false, 
        hoverCursor:'pointer'
    });
    canvas.add(rect);
    canvas.add(nGridGroup);
}

function getColorPalette() {
    
    $('.tab_custom').css("height", $('.colortab_custom'));
    var col_array = [];
    var col_name_array = [];
    var img_dir_array = [] ;
    var img_pat_array = [] ;
    var img_name_array = [] ;
    var col_group_name = "";
    var pattern_group_name = "";
    
    var xml = "<request><sessionid>" + sessionid + "</sessionid></request>";
    
    $.ajax({
        type: "POST",
        url: url + "/Site.svc/ColorPaletteGet",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify($.xml2json(xml)),
        dataType: "json",
        success: function (response) {
            var r = response.ColorPaletteGetResult;
            if (r.isSuccessful == false) {
                alert(r.ErrorDescription + "(" + r.ErrorNumber + ")");
                return;
            } else {
                
                var data = eval(r.Data);
                var p = data[0];
                for (var x = 0; x < p.ColorPaletteGroups.length; x++) {
                    
                    var g = p.ColorPaletteGroups[x];
                    // g.Name,g.PriceIncrease g.id
                    for (var y = 0; y < g.ColorPaletteItems.length; y++) {

                        var i = g.ColorPaletteItems[y];
                        // is color?
                        if (i.HtmlColor != "")
                        {
                            col_group_name = g.Name;
                            col_array[y] = i.HtmlColor;
                            col_name_array[y] = i.MediaColorName;
                        }
                        // is pattern?
                        else if(i.HtmlColor == "" && i.PreviewImage != "" )
                        {
                            pattern_group_name = g.Name;
                            img_dir_array[y]   = i.PreviewImage;
                            img_name_array[y]  = i.MediaColorName;
                            img_pat_array[y]   = i.PatternImage;
                            // console.log(y+img_dir_array[y]);
                        }
                        // console.log(i.PatternImage);
                        /* 
                        This is Object Item of ColorpaletteItems
                        i.ID,MediaColorID,MediaColorName,HtmlColor,PatternImage,PreviewImage,MediaColorTypeID,MediaColorTypeName 
                        */
                    }
                }
                var strx = "";
                var stry = "";
                for (var i = 0; i < col_array.length; i++) {
                    strx += "<a class='btn btn-default selectcolor' style='background:"+col_array[i]+";' title='"+col_name_array[i] +"'></a>";
                }

                for (var i = 0; i < img_dir_array.length; i++) {
                    //console.log(img_dir_array.length);
                    stry += "<a class='btn btn-default selectcolor' style='background-image:url(" + url + img_dir_array[i] + ");margin-top:3px; margin-left :3px' title='" + img_name_array[i] + "'></a>";
                    stry += "<img id='img_pattern_" + i + "' src='" + url + img_pat_array[i] + "' style='display:none'>";

                    // var img = new Image();
                    // img.crossOrigin="anonymous";
                }    
                $('#colorpad').html(strx);
                $('#patternpad').html(stry);
                $('#colorx').html("<span class='glyphicon glyphicon-menu-down' aria-hidden='true'></span>  " + col_group_name);
                $('#patternx').html("<span class='glyphicon glyphicon-menu-down' aria-hidden='true'></span>  " + pattern_group_name);
            }
        }
    });
}

function colourNameToHex(colour) {
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}

// When select a text object, add it on clipart layer and make to active its state.
function selectTextObj(selectedObj) {

    var selectedObjId = selectedObj.id;
    $(".cliparteditor").hide();
    $(".texteditorext").show();
    if (removeobj == 0) {
        $(".colortab_custom").show();
        if(isSelectClipObj == 0)
        {
            $(".texteditor").show();
            $('.cliparteditor').hide();
        }
        else{
            $(".texteditor").hide();
            $('.cliparteditor').show();
        }
    }
    removeobj = 0;
    // Set value to html elements.

    activeObj = selectedObj;
        selectedObj.setControlsVisibility({'bl': true, 'br': true, 'mb': true, 'ml': true, 'mr': true, 'mt': true});
        $('#clipart_width_text,  #clipart_width_range').prop('disabled', false);
        $('#clipart_height_text, #clipart_height_range').prop('disabled', false);
    
    // $('#clipart_size_text,  #clipart_size_range').val( parseFloat(selectedObj.getFontSize()) );
    // $('#clipart_spacing_text, #clipart_spacing_range').val( parseFloat(selectedObj.spacing) );
    $('#clipart_rotate_text,  #clipart_rotate_range').val( selectedObj.getAngle() );
    // $('#clipart_arc_text,  #clipart_arc_range').val( selectedObj.radius );

    $('#clipart_layer').find('li.active').removeClass('active');
    $('#clipart_layer').find("[data-id='text_" + selectedObjId + "']").addClass('active');
    $('#lock').attr('data-lock', 'false');
    $('#lock').css('background-position', '0 -3650px');

    selectedObj.setControlsVisibility({'bl': true, 'br': true, 'mb': true, 'ml': true, 'mr': true, 'mt': true});
    $('#clipart_width_text,  #clipart_width_range').prop('disabled', false);
    $('#clipart_height_text, #clipart_height_range').prop('disabled', false);
}

function selectClipartObj(selectedObj) {
    
    var selectedObjId = selectedObj.id;
    var ca = design_clipart[selectedObjId];
    var html = '';
    $(".cliparteditor").show();
    $(".texteditorext").hide();

    if (removeobj == 0) {
	$('.cliparteditor').show();
        $(".colortab_custom").show();
        $(".texteditor").hide();
    }
    removeobj = 0;
    // Set value to html elements.

    for (var i = 0; i < ca.CanvasObject.Colors.length; i ++) {
        html += '<a class="btn btn-default colorpicker selectcolor" data-id="' + i 
             + '" style="background-color: ' 
             + ca.CanvasObject.Colors[i].HtmlColor 
             + '"></a>';
    }

   // console.log(selectedObj.getWidth());
   // console.log(selectedObj.getHeight());

    if(selectedObj.sizelock)
    {
        selectedObj.setControlsVisibility({'bl': false, 'br': false, 'mb': false, 'ml': false, 'mr': false, 'mt': false});
        $('#clipart_width_text,  #clipart_width_range').prop('disabled', true);
        $('#clipart_height_text, #clipart_height_range').prop('disabled', true);
    }
    else
    {
        selectedObj.setControlsVisibility({'bl': true, 'br': true, 'mb': true, 'ml': true, 'mr': true, 'mt': true});
        $('#clipart_width_text,  #clipart_width_range').prop('disabled', false);
        $('#clipart_height_text, #clipart_height_range').prop('disabled', false);
    }

    $('#colorlayer').html(html);
    $('#clipart_width_text,  #clipart_width_range').val( parseFloat(selectedObj.getWidth()) );
    $('#clipart_height_text, #clipart_height_range').val( parseFloat(selectedObj.getHeight()) );
    $('#clipart_angle_text,  #clipart_angle_range').val( selectedObj.getAngle());

    $('#clipart_layer').find('li.active').removeClass('active');
    $('#clipart_layer').find("[data-id='image_" + selectedObjId + "']").addClass('active');
    // create design_colors array of selected clipart.

    ratio = selectedObj.getWidth() / selectedObj.getHeight();

    canvas.renderAll();
}

// Select a color layer.

$('body').on('click', '#colorlayer a', function(event) {
    selectedColorlayer = $(this).attr('data-id'); 
});

// Select a color in color pad.
$('body').on('click', '#colorpad a', function(event) {
    
    if (activeObj.objType == 'image') {
        if (design_clipart[activeObj.id].design_colors.length <= selectedColorlayer) {
            selectedColorlayer = 0;
        }

        design_clipart[activeObj.id].design_colors[selectedColorlayer].HtmlColor = $(this).css('background-color');
        $('#colorlayer').children().eq(selectedColorlayer).css('background-color', $(this).css('background-color'));
        $('#colorlayer').children().eq(selectedColorlayer).css('background-image', '');
        isSelectedColor = true;

        design_colors = design_clipart[activeObj.id].design_colors;

        updateObjColor();
    } else {
        isSelectedColor = true;
        
        activeObj.set('fill' , $(this).css('background-color'));
        canvas.renderAll();
    }
});

// Select a pattern in pattern pad.
$('body').on('click', '#patternpad a', function(event) {
    isSelectedColor = true;

    if (activeObj.objType == 'image') {
        if (design_clipart[activeObj.id].design_colors.length <= selectedColorlayer) {
            selectedColorlayer = 0;
        }

        design_clipart[activeObj.id].design_colors[selectedColorlayer].HtmlColor = $(this).next().attr('id');
        $('#colorlayer').children().eq(selectedColorlayer).css('background-color', '');
        $('#colorlayer').children().eq(selectedColorlayer).css('background-image', $(this).css('background-image'));
        
        design_colors = design_clipart[activeObj.id].design_colors;

        updateObjColor();    
    } else {
        $('#colorlayer').children().eq(0).css('background-color', '');
        $('#colorlayer').children().eq(0).css('background-image', $(this).css('background-image'));

        fabric.util.loadImage($(this).next().attr('src'), function(img) {
            activeObj.fill = new fabric.Pattern({
                source: img,
                repeat: 'repeat'
            });
            canvas.renderAll();
        });
    }
});

var ratio;

var isChagingAngle = false;
$('#clipart_angle_text, #clipart_angle_range').mousedown(function(event) {
    isChagingAngle = true;
}).mousemove(function () {
    if (! isChagingAngle) return;

    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

    var val = parseInt($(this).val());
    selectedObj.setAngle(val);

    $('#clipart_angle_text, #clipart_angle_range').val(val);
    canvas.renderAll();
}).mouseup(function(event) {
    isChagingAngle = false;
});

// ---------------------------------------------------------------------------
// clipart width
var isChagingWidth = false;
$('#clipart_width_text, #clipart_width_range').mousedown(function(event) {
    isChagingWidth = true;
}).mousemove(function () {
    if (! isChagingWidth) return;

    
    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

    var val = parseFloat($(this).val());
    //console.log(ratio);
    if ($('#lock').attr('data-lock') == 'true') {
        selectedObj.setHeight(val / ratio);
        $('#clipart_height_text, #clipart_height_range').val(val / ratio);
    }

    selectedObj.setWidth(val);
    $('#clipart_width_text, #clipart_width_range').val(val);
    canvas.renderAll();    
    
}).mouseup(function(event) {
    isChagingWidth = false;
});

// ---------------------------------------------------------------------------
// clipart height
var isChagingHeight = false;
$('#clipart_height_text, #clipart_height_range').mousedown(function(event) {
    isChagingHeight = true;
}).mousemove(function(event) {
    if (! isChagingHeight) return;

    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

    var val = parseFloat($(this).val());
    //console.log(canvas);
    if ($('#lock').attr('data-lock') == 'true') {
        selectedObj.setWidth(val * ratio);
        $('#clipart_width_text, #clipart_width_range').val(val * ratio);
    }
    selectedObj.setHeight(val);
    $('#clipart_height_text, #clipart_height_range').val(val);
    canvas.renderAll();
    
}).mouseup(function(event) {
    isChagingHeight = false;
});

// ---------------------------------------------------------------------------
// text rotate
$('#clipart_rotate_text, #clipart_rotate_range').mousedown(function(event) {
    isChagingAngle = true;
}).mousemove(function () {
    if (! isChagingAngle) return;

    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;
    var val = parseInt($(this).val());
    selectedObj.setAngle(val);
    $('#clipart_rotate_text, #clipart_rotate_range').val(val);

    canvas.renderAll();
}).mouseup(function(event) {
    isChagingAngle = false;
});

// ---------------------------------------------------------------------------
// Text arc
$('#clipart_arc_text, #clipart_arc_range').mousedown(function(event) {
    isChagingAngle = true;
}).mousemove(function () {
    if (! isChagingAngle) return;

    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null)
        return;
    var val = parseInt($(this).val());
    selectedObj.set('radius', val);
    $('#clipart_arc_text, #clipart_arc_range').val(val);

    canvas.renderAll();
}).mouseup(function(event) {
    isChagingAngle = false;
});

// ---------------------------------------------------------------------------
// Text spacing
$('#clipart_spacing_text, #clipart_spacing_range').mousedown(function(event) {
    isChagingAngle = true;
}).mousemove(function () {
    if (! isChagingAngle) return;

    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null || selectedObj.getBoundingRectWidth() > canvas.width) 
        return;

    var val = parseInt($(this).val());
    // selectedObj.set('spacing', val);
    var left = selectedObj.item(0).left;
    for (var i = 0; i < selectedObj.size(); i ++) {
        selectedObj.item(i).left = left;
        
        left += selectedObj.item(i).getWidth() + val * 1 / selectedObj.getScaleX();
    }
    _render(selectedObj);

    $('#clipart_spacing_text, #clipart_spacing_range').val(val);

    
}).mouseup(function(event) {
    isChagingAngle = false;
});

// ---------------------------------------------------------------------------
// Text stretch
var isChagingWidth = false;
$('#clipart_stretch_text, #clipart_stretch_range').mousedown(function(event) {
    isChagingWidth = true;
}).mousemove(function () {
    if (! isChagingWidth) return;

    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

    var val = parseFloat($(this).val());
    val = val * 10;
    if(val > canvas.width)
        val = canvas.width;
    selectedObj.scaleWidth(val);
    $('#clipart_stretch_text, #clipart_stretch_range').val(val);
    _render(selectedObj);

}).mouseup(function(event) {
    isChagingWidth = false;
});

// ---------------------------------------------------------------------------
// Text lnheight
var isChagingHeight = false;
$('#clipart_lnheight_text, #clipart_lnheight_range').mousedown(function(event) {
    isChagingHeight = true;
}).mousemove(function(event) {
    if (! isChagingHeight) return;
    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

    var val = parseFloat($(this).val());
    val = val * 5;
    if(val > canvas.height)
        val = canvas.height;
    selectedObj.scaleHeight(val);
    $('#clipart_lnheight_text, #clipart_lnheight_range').val(val);
    _render(selectedObj);

}).mouseup(function(event) {
    isChagingHeight = false;
});

// ---------------------------------------------------------------------
// text size
$('#clipart_size_text, #clipart_size_range').mousedown(function(event) {
    isChagingAngle = true;
}).mousemove(function () {
    if (! isChagingAngle) return;

    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null)
        return;

    var val = parseInt($(this).val());
    selectedObj.scale(val);
    $('#clipart_size_text, #clipart_size_range').val(val);

    canvas.renderAll();
}).mouseup(function(event) {
    isChagingAngle = false;
});


$('.layer_up').click(function(event) {
    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

    canvas.bringToFront(selectedObj);
    
    // Update object tab
    var id      = selectedObj.id;
if(activeObj.objType == "image")
    {
        var selLi   = $('#clipart_layer').find("[data-id='image_" + activeObj.id + "']");    
    }
    else
    {
        var selLi   = $('#clipart_layer').find("[data-id='text_" + activeObj.id + "']");       
    }
    var prev    = selLi.prev();
    prev.before(selLi);
});

$('.layer_down').click(function(event) {
    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;
    
    if ($('#clipart_layer li:last-child').attr('data-id') == selectedObj.id)
        return;

    canvas.sendBackwards(selectedObj);

    var id      = selectedObj.id;
    if(activeObj.objType == "image")
    {
        var selLi   = $('#clipart_layer').find("[data-id='image_" + activeObj.id + "']");    
    }
    else
    {
        var selLi   = $('#clipart_layer').find("[data-id='text_" + activeObj.id + "']");       
    }
    var next    = selLi.next();
    next.after(selLi);
});

$('.position_center').click(function(event) {
    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

    selectedObj.left = parseInt(canvas.getWidth() / 2, 10);
    canvas.renderAll();
    canvas.setActiveObject(selectedObj);
});


$('#lock').click( function(event) {
    if ($(this).attr('data-lock') == 'false') {
        $(this).attr('data-lock', 'true');
        $(this).css('background-position', '0 -3600px');
    } else {
        $(this).attr('data-lock', 'false');
        $(this).css('background-position', '0 -3650px');
    }
});

$('body').on('click', '#clipart_layer li', function(e) {
  
    var data_id = $(this).attr('data-id');
    var res = data_id.split("_");
    var type = res[0];
    var id = res[1];

    console.log(type);
    console.log(id);

    $('#clipart_layer').find('li.active').removeClass('active');
    $('#clipart_layer').find("[data-id='" + data_id + "']").addClass('active');
    
    for (var i = 0; i < canvas.getObjects().length; i ++) {
        if (canvas.item(i).id == id && canvas.item(i).objType == type) {
            canvas.setActiveObject(canvas.item(i));
            selectClipartObj(canvas.item(i));

            return;        
        }
    }

});

var _placement = '';
var place_w = 0;
var place_h = 0;
$('.placement-modal .modal-body').on('click', 'div',function () {
    
    $('.placement-modal .modal-body').find('.active').removeClass('active');
    // $(this).css('border', '1px solid red');
    $(this).addClass('active');
    _placement = $(this).children('img').attr('src');
    place_w = $(this).children('img').attr('data-width');
    place_h = $(this).children('img').attr('data-height');
})

$('#select_placement').click(function(event) {
    if (_placement != '') {
        $('#placement').attr('src', _placement);

        $('.placement-modal .close').click();
        drawGrayGrid(place_w,place_h);
    }
});

function updateControls() {
    var selectedObj = canvas.getActiveObject();
    if (selectedObj == null) 
        return;

	if(selectedObj.objType == "image")
    {
        $('#clipart_width_text, #clipart_width_range').val(selectedObj.getWidth());
        $('#clipart_height_text, #clipart_height_range').val(selectedObj.getHeight());
        $('#clipart_angle_text, #clipart_angle_range').val(selectedObj.getAngle());       
    }
    else
    {
        $('#clipart_stretch_text, #clipart_stretch_range').val(selectedObj.getWidth());
        $('#clipart_lnheight_text, #clipart_lnheight_range').val(selectedObj.getHeight());
        $('#clipart_rotate_text, #clipart_rotate_range').val(selectedObj.getAngle());    
    }
    // ratio = selectedObj.getWidth() / selectedObj.getHeight();
}

// Handle canvas event
canvas.on({
    'object:modified':      checkText,
    'object:resizing':      updateControls,
    'object:rotating':      updateControls,
    'object:scaling':       updateControls,
    'object:removed':       updatelayersection,
    'selection:cleared':    removeEditPanel,  
    'object:moving':        grayCanvasBound,       
    "mouse:down":   function (e) {
                        var selectedObj = canvas.getActiveObject();
                        if (selectedObj == null) 
                            return;                       

                        activeObj = selectedObj;

                        if (activeObj.objType == 'image') {                            
                            selectClipartObj(selectedObj);    
                        } else if(activeObj.objType == 'text') {
                            selectTextObj(selectedObj);
                        }
                    },
    "mouse:move":   function(e){

    }
});
function grayCanvasBound(){
    var selectedObj = canvas.getActiveObject();
    lpos = selectedObj.getBoundingRect().left;
    tpos = selectedObj.getBoundingRect().top;
    gwidth = selectedObj.getBoundingRect().width;
    gheight = selectedObj.getBoundingRect().height;
    // graytlx = gridlp;
    // graytly = gridtp;
    // graywidth = w;
    // grayheight = h;
   // if((graytlx>lpos && graytly<tpos) || (graytlx+graywidth>lpos+gwidth && graytly+grayheight<tpos+gheight) || )
    //if(selectedObj)
}


function checkText(e) {

    var b = e.target;
    var c = this;
    var selectedObj = canvas.getActiveObject();
    var ratio = selectedObj.getWidth()/selectedObj.getHeight();
    var selectedObjId = selectedObj.id;
    
    if(selectedObj.objType == "image")
    {
        var cid = 'image_' + selectedObjId;
    }
    else{
        var cid = 'text_' + selectedObjId;
    }
    var angle = selectedObj.getAngle();
    if(ratio>1)
    {
        $('#'+cid).css('transform','rotate('+angle+'deg) scale(1,'+1/ratio+')');
    }
    else{
        $('#'+cid).css('transform','rotate('+angle+'deg) scale('+ratio+',1)');
    }   

}

function updatelayersection() {
    if ( ! isSelectedColor) {
        $('.colortab_custom').hide();

        if (activeObj.objType == 'image') {
            $('#clipart_layer').find("[data-id='image_" + activeObj.id + "']").remove();   
        } else {
            $('#clipart_layer').find("[data-id='text_" + activeObj.id + "']").remove();
        } 
        
        removeobj = 1;
     //   console.log(isSelectedColor);
    }

    isSelectedColor = false;
}

function removeEditPanel() {
    if ( ! isSelectedColor) {
        $(".colortab_custom").hide();    
    }
}
$('#addText').click(function(){
    $('.colortab_custom').show();

    $('.texteditor').show();
    $('.cliparteditor').hide();
})


    // $('.accordion').click(function(e){
    //     $('.tab_custom').height($('.colortab_custom').height());
    // });
    $('#add').click(function(event) {
        drawClipArt($('#ddlClipArt').val(), $('#myCanvas').width() / 2, $('#myCanvas').height() / 2);
    });

    $('body').on('click','#listClipArt li',function(event) { 
        //console.log($(this).html());
        
        drawClipArt($(this).attr('id'), $('#myCanvas').width() / 2, $('#myCanvas').height() / 2);
    });


    // When click a 'Add text' button, draw text.
    $('#add_text').click(function(event) {
        
            
        //drawCharacters($('#ddlFonts').val(), $('#tbx'), $('#myCanvas').width() / 2, $('#myCanvas').height() / 2);
        
    });
    // $('body').on('click','#addText',function(event) {
        
    //        if(isaddtext ==0)
    //        {

    //             $('.texteditor').show();
    //             $('.cliparteditor').hide();
    //             isaddtext = 1;
    //        }
    //        // else if(isaddtext ==1)
    //        // {
    //        //      drawCharacters($('#ddlFonts_form').val(), $('#tbx'), $('#myCanvas').width() / 2, $('#myCanvas').height() / 2);
    //        // }
       
        
    // });
    $('#ddlFonts_form').change(function(){
        
               drawCharacters($('#ddlFonts_form').val(), $('#tbx'), $('#myCanvas').width() / 2, $('#myCanvas').height() / 2);        
    });

    $('body').on('click','.colorpicker',function(e) {
        $('.firstp').hide();
        $('.secondp').show();
        $('.tab_custom').css("height", $('.colortab_custom').css("height"));
    });

    $('body').on('click','.closebtn',function(e) {
        $('.secondp').hide();
        $('.firstp').show();
    });
    
    
   
let ga = window.ga;
let PAGE_TO_TRACK = window.PAGE_TO_TRACK;
let noUiSlider = window.noUiSlider;
let riveted = window.riveted;

class ReutersUtils {
    // http://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
    static getJsonFromUrl(hashBased = null){
        let query;
        if(hashBased) {
            let pos = location.href.indexOf('?');
            if(pos == -1) return [];
            query = location.href.substr(pos+1);
        } else {
            query = location.search.substr(1);
        }
        let result = {};
        query.split('&').forEach(function(part) {
            if(!part) return;
            part = part.split('+').join(' '); // replace every + with space, regexp-free version
            let eq = part.indexOf('=');
            let key = eq > -1 ? part.substr(0,eq) : part;
			let val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
            //convert true / false to booleans.
            if(val == 'false'){
                val = false;
            }else if(val == 'true'){
                val = true;
            }

            let f = key.indexOf('[');
            if(f == -1){ 
                result[decodeURIComponent(key)] = val;
            }else {
                var to = key.indexOf(']');
                var index = decodeURIComponent(key.substring(f + 1,to));
                key = decodeURIComponent(key.substring(0,f));
                if(!result[key]){
                    result[key] = [];
                }
                if(!index){
                    result[key].push(val);
                }else{
                    result[key][index] = val;
                }
            }
        });
        return result;
    }

    static addCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    static trackEvent(category, type, id){
        category = category || 'Page click';
        //console.log(category, type, id);
        let typeString = type;
        if(id){
            typeString += ': ' + id;
        }
        let gaOpts = {
            'nonInteraction': false,
            'page': PAGE_TO_TRACK
        };
        
        
        ga('send', 'event', 'Default', category, typeString, gaOpts);
    }

    static generateSliders(){
        $('[data-slider]').each(function(){
            let $el = $(this);
            let getPropArray = (value) => {
                if(!value){
                    return [0];
                }
                let out = [];
                let values = value.split(',');
                values.forEach((value) =>{
                    out.push(parseFloat(value));    
                });
                return out;
            };
            let pips = undefined;
            let start = getPropArray($el.attr('data-start'));
            let min = getPropArray($el.attr('data-min'));
            let max = getPropArray($el.attr('data-max'));
            let orientation = $el.attr('data-orientation') || 'horizontal';
            let step = $el.attr('data-step') ? parseFloat($el.attr('data-step')) : 1;
            let tooltips = $el.attr('data-tooltips') === 'true' ? true : false;
			let connect = $el.attr('data-connect') ? $el.attr('data-connect') : false;
            let snap = $el.attr('data-snap') === 'true' ? true : false;
            let pipMode = $el.attr('data-pip-mode');
            let pipValues = $el.attr('data-pip-values') ? getPropArray( $el.attr('data-pip-values')) : undefined;
            let pipStepped = $el.attr('data-pip-stepped') === 'true' ? true : false;
            let pipDensity = $el.attr('data-pip-density') ? parseFloat($el.attr('data-pip-density')) : 1;
            if(pipMode === 'count'){
                pipValues = pipValues[0];
            }

            if(pipMode){
                pips = {
                    mode: pipMode,
                    values: pipValues,
                    stepped: pipStepped,
                    density: pipDensity
                }
            }
            

            if(connect){
                let cs = [];
                connect.split(',').forEach((c) =>{
                    c = c === 'true' ? true : false;
                    cs.push(c);
                });
                connect = cs;
            }
            
            noUiSlider.create(this, {
                start: start,
                range: {
                    min: min,
                    max: max
                },
                snap: snap,
                orientation: orientation,
                step: step,
                tooltips: tooltips,
                connect: connect,
                pips: pips
            });
            //This probably doesn't belong here, but will fix the most common use-case.
            $(this).find('div.noUi-marker-large:last').addClass('last');
            $(this).find('div.noUi-marker-large:first').addClass('first');
        });



    }

    static getRealImageSize(img, type){
        let $img = $(img);
        let width, height;
        if(type === 'image'){
            if ($img.prop('naturalWidth') == undefined) {
            	let $tmpImg = $('<img/>').attr('src', $img.attr('src'));
                $img.prop('naturalWidth', $tmpImg[0].width);
                $img.prop('naturalHeight', $tmpImg[0].height);
            }
            width = $img.prop('naturalWidth');
            height = $img.prop('naturalHeight');
        }else if(type === 'video'){
            width = $img.prop('videoWidth');
            height = $img.prop('videoHeight');
        }
        
        return { width, height };
    }


    static autoCropMedia($container, $offsetElement, additionalOffset, autoResize = true){
        let $img = $container.find('img:first');
        let type = 'image';
        if(!$img.length){
            $img = $container.find('video:first');
            type = 'video';
        }
        let $caption = $container.find('.caption-container');
        let winH = window.innerHeight;
        let winW = window.innerWidth;
        let width = winW;
        let height = winH;
        if($offsetElement && $offsetElement.length){
            height = height - $offsetElement.outerHeight();
        }
        if(additionalOffset){
            height = height - additionalOffset;
        }
        
        if($caption.length){
            height = height - $caption.outerHeight();
        }
        
        let targetHeight = height;
        let realSize = Reuters.getRealImageSize($img, type);
        let ratio = realSize.width / realSize.height;
        //should check again later, no?
        if(realSize.width == 0){
            _.delay(function(){ Reuters.autoCropMedia($container, $offsetElement, additionalOffset, autoResize); }, 800);
            return;
        }
        
        if(autoResize){
            let resizer = function(){
                ReutersUtils.autoCropMedia($container, $offsetElement, additionalOffset, false);
            }

            $(window).on('resize', resizer);
        }
        
        let left = (winW - (height * ratio)) / 2;
        let top = 0;
        if((height < 400) || (winW < 768)){
            //console.log(height, width);
            $container.css({'height': 'auto', 'width': '100%'});
            $img.css({'width': '100%', 'height': 'auto', 'margin-top': 0, 'margin-left': 0});
            return;
        }
        
        $container.height(height);
        
        if(left > 0){
            left = 0;
            width = winW;
            height = width / ratio;
            top = (targetHeight - height) / 2;
            //console.log('width', width, 'height', height, 'top', top, 'ratio', mastheadRatio);
        }else{
            width = height * ratio;
        }
        
        //console.log($img, 'width', width, 'height', height, 'top', top, 'left', left, 'ratio',ratio);
        
        $img.height(height);
        $img.width(width);
        $img.css({
            'margin-left': left + 'px', 
            'margin-top': top + 'px',
            'opacity': 1
        });

        
    }

    static centerFullSizeMedia($container, $media, mediaType, autoResize = true){
        //flexbox makes this almost simple. Still need to decide which to make 100%.
        let realSize = Reuters.getRealImageSize($media, mediaType);
        //should check again later, no?
        if(realSize.width == 0){
            _.delay(function(){ Reuters.centerFullSizeMedia($container, $media, mediaType, autoResize); }, 800);
            return;
        }
        if(autoResize){

            let resizer = function(){
                ReutersUtils.centerFullSizeMedia($container, $media, mediaType, false);
            }
            
            $(window).on('resize', resizer);
        }
        
        let $parent = $media.parent();
        $parent.removeClass('wide tall');
        let ratio = realSize.width / realSize.height;
        
        if( ($container.width() / $container.height()) < ratio){
            $parent.addClass('wide');
        }else{
            $parent.addClass('tall');
        }

        
    
    }

    static popupGallery(){


        let resizer = function(){
            let $item = $('.popup-gallery .media-item.selected');
            if(!$item.length){
                return;
            }
            let $mediaItem = $item.find('img:first');
            let type = 'image';
            if(!$mediaItem.length){
                $mediaItem = $item.find('video:first');
                type = 'video';
            }
            ReutersUtils.centerFullSizeMedia($item.find('.media-container'), $mediaItem, type, false);
        }

        let checkButtons = () => {
        	let $item = $('.popup-gallery .media-item.selected');
            $gallery.find('.next, .prev, .page-button').prop('disabled', false);
            if(!$item.next().length){
                $gallery.find('.next').prop('disabled', true);
            }
            if(!$item.prev().length){
                $gallery.find('.prev').prop('disabled', true);
            }
        }

        let showPage = (id) => {
            console.log(id);
            $gallery.children().find('.selected').removeClass('selected');
            let $new =  $gallery.find(`img[src*="${ id }"], video[src*="${ id }"]`).parents('.media-item');
            $new.addClass('selected');
            resizer();
            checkButtons();
        }

        let mediaHtml = '';

        let $media = $('.popup-gallery-item');
        $media.each(function(index){
            let $item = $(this); // I wish JQuery didn't work this way.
            $item.on('click', () =>{
                $('.popup-gallery').addClass('show-gallery');
                let id = $item.find('img').prop('src');
                if(!id){
                    id = $item.find('video').prop('src');
                }
                showPage(id);
            });
            //now we want to screw with the html
            $item = $item.clone();
            $item.find('.caption').append(`<span class="count">${ index + 1 } / ${ $media.length }</span>`);

            mediaHtml += $('<div />').append($item.clone()).html();
        });


    

        

        let galleryHtml = `
            <div class="popup-gallery">
                <div class="controls hidden-lg-up">
                    <div class="btn-group flex-row d-flex justify-content-end" role="group">
                        <button type="button" class="btn btn-primary prev">
                            <i class="fa fa-arrow-left"></i>
                        </button>
                        <button type="button" class="btn btn-primary next">
                            <i class="fa fa-arrow-right"></i>
                        </button>
                        <button type="button" class="btn btn-primary close-button">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="media-items-container">
                        ${ mediaHtml }
                    </div>
                    <div class="controls hidden-md-down">
                        <div class="btn-group-vertical col-12" role="group">
                            <button type="button" class="btn btn-primary close-button">
                                <i class="fa fa-times"></i>
                            </button>
                            <button type="button" class="btn btn-primary next">
                                <i class="fa fa-arrow-right"></i>
                            </button>
                            <button type="button" class="btn btn-primary prev">
                                <i class="fa fa-arrow-left"></i>
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        `;
        let $gallery = $(galleryHtml);
        $('body').append($gallery);
        
        $gallery.find('.close-button').on('click', () => {
            $gallery.removeClass('show-gallery');
        });

        $gallery.find('.prev').on('click', () => {
            let $selected = $gallery.children().find('.selected');
            let $new = $selected.prev();
            if (!$new.length){
                return;
            }
            $new.addClass('selected');
            $selected.removeClass('selected');
            resizer();
            checkButtons();
            
        });

        $gallery.find('.next').on('click', () => {
            let $selected = $gallery.children().find('.selected');
            let $new = $selected.next();
            if (!$new.length){
                return;
            }
            $new.addClass('selected');
            
            $selected.removeClass('selected');
            resizer();
            checkButtons();
        });

        $gallery.find('.page-button').on('click', () => {
        	let $page = $(this);
            let pageId = $page.attr('data-id');
            $page.addClass('selected').siblings.removeClass('selected');
            showPage(pageId);
        });


        window.$gallery = $gallery;
        $(window).on('resize', resizer);

        $gallery.find('.media-item:first').addClass('selected');
        checkButtons();
    }

    static enableTooltips(){
        $('[data-toggle="tooltip"]').tooltip();
    }
 
    static initStatTracking(){
        //stats
        let $els = $('article[id], section[id]');
        let elements = [];
        _.each($els, function(el){
            try{
                //should toss an error if ScrollDepth will bomb trying to track this element.
                //ad ids are not formatted correctly, apparently. Because of course.
                $(el.tagName.toLowerCase() + '#' + el.id);
                elements.push(el.tagName.toLowerCase() + '#' + el.id);
            }catch(e){
                //pass.
            }
        });


        let scrollDepthOpts = {elements: elements, page: undefined};
        let rivetedOpts = {reportInterval: 20, idleTimeout: 60, nonInteraction: false, page: undefined};
        try{
            //why throwing undefined if checking for it?
            if(PAGE_TO_TRACK !== undefined){
                scrollDepthOpts.page = PAGE_TO_TRACK;
                rivetedOpts.page = PAGE_TO_TRACK;
            }
        }catch(e){

        }

        try{
            $.scrollDepth(scrollDepthOpts);
            riveted.init(rivetedOpts);
        }catch(e){
            console.log('scrolldepth or rivited undefined');
        }


        $('.social.navbar-nav a, .share.share-in-article a').on('click', function(){
            let $el = $(this);
            let type = $el.attr('data-id');
            Reuters.trackEvent('article', 'share clicked', type);
        });


    }

}




console.log("%c \n" +
            "                                                                                \n" +
            "                                                                                \n" +
            "                                                                                \n" +
            "                                                                                \n" +
            "                                                                                \n" +
            "                              .       .;;.       .                              \n" +
            "                            .;;,      .''.      ,;,                             \n" +
            "                    .,'.     ..                 ..      .''.                    \n" +
            "                   .:cc,                                ;cc:.                   \n" +
            "                    ...           ...     ';'            ...                    \n" +
            "            ,::;.           ..    ...     ',.   .:::.          ':::'            \n" +
            "           .:ccc,          ...                  .,;,.  .''.    ;ccc;            \n" +
            "            ....     .'.           .     .'..         'ccc:.    ...             \n" +
            "      .','.          ..           'c;.   ;cc'  .;:,   .,;;'  ..      .','.      \n" +
            "     .:cccc'    ..          .;.    .      ..   ;lll.       .:llc'   ,cccc:.     \n" +
            "     .:ccc:'   .:c'              ..  .:c;. ';,. ... .clc;  'llll;   ,cccc:.     \n" +
            "      ..'..     ..     ..        ;:' .,;, .cll. .'. ,lllc.  .','...  ....       \n" +
            "   .''.      ..              ;,   . .'.  .. .. .ll,  ...  ..   ,cllc.   ..''.   \n" +
            " .cllllc.  .:c:.    .           .:c..:' .'. .,     .''  .cll; .cllll:  .lllll:. \n" +
            " ,llllll'   .,'    .,.   .'   ,;..'.           ..  .,'   ,::.  .;::,.  ;llllll. \n" +
            "  ,:ll:'                     ..'.                     ..          .''. .,cll:'  \n" +
            "   ..    .,:;'    .     .   ';.                   .   ',.  .::'  ;llll'   ...   \n" +
            ".;cll:'  'ccc:.  ,c;       ..                      .       .,;.  'lllc.  ,cllc,.\n" +
            "cllllll,  ....    .    .   ..                      .   ..          ..   ;llllll:\n" +
            ":llllll'  .''.         ..  ..                      ,.       ...   .,,.  ,llllll;\n" +
            " ';::,.  ,llll'  ,::.       .                     ..        ;:.  .cccc.  .;::;. \n" +
            "   ....  'lllc.  ',,.  .;.   .                   .;.   .          .,,.   ....   \n" +
            " .;llll;. ....                 .               .;'                     .:llll,  \n" +
            " ,llllll,  'cll:.  ;ll;  .;;.  .  .         .;,.'.  .'    .;.   .;;'   ;llllll. \n" +
            " .:llll:. .cllll:  ;ll;   .. ...  '. ',. ;c..;,  ..             .::,   .:llll;  \n" +
            "   ....    .;cc;.      .,,.  :ll. ... .  ..  .   ,'                      ....   \n" +
            "      .,,,.    .;:;'  .llll'  .. ,llc .:c:. ,:,        .     ...     .,,'.      \n" +
            "     'ccccc,  .cllll.  ,::,. .,'  .'. .,,'        .          ,:;.   ;cccc:.     \n" +
            "     .:ccc:.   .:c:,        'lll,  ....    ..    .'.                ':ccc:.     \n" +
            "       ....         .;::;.   .,'   ,cc,   .::.          .'.          ....       \n" +
            "            .','.   .:cc:.          ..                   ..    .','.            \n" +
            "           .:ccc,    ...   .::;.                  .,.          ;ccc:            \n" +
            "            .;;,.          .,;'   .;:,     ',.     .           .,;,.            \n" +
            "                    .''.           .'.     ..           .''.                    \n" +
            "                   .:cc,                                ;cc:.                   \n" +
            "                    ...      ...                ...      ...                    \n" +
            "                             ,;'      .,,.      ,;'                             \n" +
            "                                      .;;.                                      \n" +
            "                                                                                \n" +
            "                                                                                \n" +
            "                                                                                \n" +
            "                      Reuters Investigates Publisher                            \n" +
            "            Charlie Szymanski, Matt Weber, & Troy Dunkley, 2017                 \n" +
            "                                                                                \n" +
            "                                                                                ",
            'color:#FF8000;');









export { ReutersUtils }
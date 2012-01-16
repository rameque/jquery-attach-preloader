// JavaScript Document
(function($) {
	
	$.preloader = {};
	
	$.preloader.constants = {
		IMAGE:'image',
		TEXT:'text',
		LOADINGMSG:'Cargando recurso: ',
		ERRORMSG:'Error al cargar : ',
		ERRORTIMEOUTMSG:'Descartado por TIMEOUT',
		UNKNOWN:'Desconocido',
		SIZE:'Peso'
	}
	
	$.preloader.settings = {
		timeout:1000,
		flag:null,
		items:[],
		inParallelLoad:false,
		inOrderLoad:true,
		onComplete:function(){},
		onCompleteItem:function(){},
		loadMessage:$.preloader.constants.LOADINGMSG,
		errorMessage:$.preloader.constants.ERRORMSG,
		sizeResource:false,
		removeByTimeOut:false
	}
	
	$.preloader.package = {
		file:function(){
			this.type='';
			this.src='';
			this.data='';
			this.order='';
			return {type:this.type,src:this.src,data:this.data};
		},
		responseObject:function(){
			this.errorFiles = [];
			this.successFiles = [];
			return true;
		}
	}
	$.preloader.private = {
		settings:{
			_logError:'',
			_flag:null,
			_target:{},
			_countItemsOrder:0,
			__countItemsOrderParallel:0,
			_regExpImage:/image\/(jpeg|pjpeg|gif|png|bmp)/i,
			_regExpText:/text\/(html|htm|css|stm|txt)/i,
			_regExpExtensionImg: /\.(png|jpg|gif)/i,
			_regExpExtensionText: /\.(htm|html|php|xml|json|css|js)/i,
			_totalItemstoLoad:$.preloader.settings.items.length,
			_queueXMLFiles:[],
			_queueHTMLFiles:[],
			_queueImagesFiles:[],
			_queueOrderFiles:[],
			_queueReadyFiles:[],
			_queueErrorFiles:[]
		},
		constants:{
			HEAD:'head',
			TIMEOUT:'timeout',
			SUCCESS:'success',
			ERROR:'error',
			COMPLETE: 'complete'
		}
	}
	
	$.preloader.methods = {
		init : function(options) {
			
			$.extend($.preloader.settings, options);
			
			if(typeof this == 'function'){
					
				//console.log('init-function');
				//console.log($.preloader.settings.items);
				//console.log($.preloader.settings.onCompleteItem);
				
				$.preloader.settings.inParallelLoad = ($.preloader.settings.onCompleteItem)? true : false;
				
				($.preloader.settings.inParallelLoad) ? $.preloader.settings.inOrderLoad = false : $.preloader.settings.inOrderLoad = true;
				
				$.preloader.methods.createEventPreload('body');
				$.preloader.private.settings._flag = $.preloader.methods.createFlag();
				
				if($.preloader.settings.items.length > 0){
					//console.log($.preloader.settings.inParallelLoad)
					if(!$.preloader.settings.inParallelLoad){
						$.preloader.methods.loadQueue(true);
					}else{
						$.each($.preloader.settings.items,function(item,value){
							$.preloader.private.settings._countItemsOrder++;
							$.preloader.methods.responseLoadQueue(value);
						});
					}	
				}
				
					
			} else if(typeof this == 'object'){
				return this.each(function() {
					//console.log('init-object');	
				});
			}
		},
		createFlag:function(){
			if(!$.preloader.settings.flag){
				$('body').append('<div class="flag" id="flag"></div>');
				$.preloader.settings.flag = '#flag';
			}
			
			return $($.preloader.settings.flag);
		},
		createEventPreload:function(target){
			
			(target)? $.preloader.private.settings._target = target : $.preloader.private.settings._target = 'body';
			
			$($.preloader.private.settings._target).bind('loaded',function(){
				if(!$.preloader.settings.inParallelLoad){
					$.preloader.methods.loadQueue($.preloader.settings.inOrderLoad);
				}
			});
		},
		dispatchEventPreload:function(){
			$($.preloader.private.settings._target).trigger('loaded');
		},
		validateType:function(value,size){

				var type = null;
				if($.preloader.private.settings._regExpExtensionImg.test(value)){
					type = $.preloader.constants.IMAGE;
				}else if($.preloader.private.settings._regExpExtensionText.test(value)){
					type = $.preloader.constants.TEXT;
				}else{
					type = $.preloader.constants.UNKNOWN;
				}
				
				switch(type){
					case $.preloader.constants.IMAGE:
						$.preloader.methods.loadImage(value,size);
						break;
					case $.preloader.constants.TEXT:
						$.preloader.methods.loadText(value,size);
						break;
					case $.preloader.constants.UNKNOWN:
						//console.log($.preloader.constants.UNKNOWN);
						$.preloader.methods.dispatchEventPreload();
						break;
				}
				
				return type;
		},
		loadQueue:function(){
			
			
			var inOrder = $.preloader.settings.inOrderLoad;
			var limit = $.preloader.settings.items.length;
			var element = $.preloader.settings.items[$.preloader.private.settings._countItemsOrder]
			var order = '';
			
			$.preloader.private.settings._countItemsOrder++;
			
			if( $.preloader.private.settings._countItemsOrder <= limit){
				$.preloader.methods.responseLoadQueue(element);	
			}else{
				$.preloader.methods.complete();
			}
			
		},
		responseLoadQueue:function(element){
			if($.preloader.settings.sizeResource){
				var xhr = $.ajax({
					type: $.preloader.private.constants.HEAD,
					url: element,
					timeout: $.preloader.settings.timeout,
					complete : function(xhr, status) {
						switch(status)
						{
							case $.preloader.private.constants.TIMEOUT:
							case $.preloader.private.constants.SUCCESS:
							case $.preloader.private.constants.ERROR:
							case $.preloader.private.constants.COMPLETE:
	
							size = (xhr.getResponseHeader("Content-Length")) ? $.preloader.constants.SIZE +' '+xhr.getResponseHeader("Content-Length") +' Kb' : $.preloader.constants.SIZE +' '+$.preloader.constants.UNKNOWN;
							if(status == $.preloader.private.constants.TIMEOUT && $.preloader.settings.removeByTimeOut){
								size+= ' '+$.preloader.constants.ERRORTIMEOUTMSG
								$.preloader.private.settings._queueErrorFiles.push(element);
								$.preloader.private.settings._flag.append('<span class="loading" id="resource-'+$.preloader.private.settings._countItemsOrder+'">'+$.preloader.settings.loadMessage + element+': '+size+'<br></span>');
								var flag = $('#resource-'+$.preloader.private.settings._countItemsOrder);
								$.preloader.methods.rewriteFlag(flag);
								element = 'suspend';
							}
	
							$.preloader.methods.validateType(element,size);	
							break;
						}
					}
				});
			}else{
				$.preloader.methods.validateType(element,'');		
			}	
		},
		loadImage:function(value,size){
			$.preloader.private.settings._flag.append('<span class="loading" id="resource-'+$.preloader.private.settings._countItemsOrder+'">'+$.preloader.settings.loadMessage + ': '+value+' : '+size+'<br></span>');
			//console.log('loadImage');
			var counter = $.preloader.private.settings._countItemsOrder;
			var flag = $('#resource-'+counter);
			
			var newImage =  new Image();
			$(newImage).attr('src', value);
			$(newImage).attr('id', 'pr-'+counter);
			
			var file = new $.preloader.package.file();
			file.type = $.preloader.constants.IMAGE;
			file.src = newImage.src;
			file.data = $(newImage)
			file.order = counter;
			
			$(newImage).load(function(params){
				$.preloader.methods.completeItem(file,$.preloader.private.constants.SUCCESS);
	
			});
			$(newImage).error(function(){
				$.preloader.methods.rewriteFlag(flag);
				$.preloader.methods.completeItem(file,$.preloader.private.constants.ERROR);
			});
			
		},
		loadText:function(value,size){
			//console.log('loadText');
			$.preloader.private.settings._flag.append('<span class="loading" id="resource-'+$.preloader.private.settings._countItemsOrder+'">'+$.preloader.settings.loadMessage + value+': '+size+'<br></span>');
			var counter = $.preloader.private.settings._countItemsOrder;
			var flag = $('#resource-'+counter);
			
			var file = new $.preloader.package.file();
			file.type = $.preloader.constants.TEXT;
			file.src = value;
			file.order = counter;
			file.data = '';
			
			$.ajax({
					beforeSend: function(xhrObj){
						xhrObj.setRequestHeader("Content-type","text/*");
						xhrObj.setRequestHeader("Accept","text/*");
					},
					url:value,
					success:function(data){
						//TODO: Evaluate to do something	
					},
					error:function(){
						//TODO: Evaluate to do something
					},
					complete:function(data){
						file.data = data.responseText;
						if(data.readyState == '4'){
							//console.log('complete loadText');
						$.preloader.methods.completeItem(file,$.preloader.private.constants.SUCCESS);
						}else{
							$.preloader.methods.rewriteFlag(flag);
							$.preloader.methods.completeItem(file,$.preloader.private.constants.ERROR);
						}
					}
			});
		},
		completeItem:function(file,status){
			//console.log('completeItem');
			var response = new $.preloader.package.responseObject();
			switch(status){
				case $.preloader.private.constants.SUCCESS:
					response.successFiles = [file];
					//console.log(file.order)
					$.preloader.private.settings._queueReadyFiles[file.order] = file;
					break;
				case $.preloader.private.constants.ERROR:
					response.errorFiles = [file];
					$.preloader.private.settings._queueErrorFiles[file.order] = file;
					break;
			}
			
			
			
			var order = file.order;
			var limit = $.preloader.settings.items.length;
			
			//console.log('--> '+order+' : '+limit);
			
			if($.preloader.settings.inParallelLoad){
				$.preloader.settings.onCompleteItem(response);	
			}
			
			if( order == limit){
				$.preloader.methods.complete()
			}else{
				$.preloader.private.settings.__countItemsOrderParallel++;
				$.preloader.methods.dispatchEventPreload();
			}
			
			var flag = $('#resource-'+file.order);
			flag.fadeOut();
			
		},
		complete:function(){
			//console.log('Complete');
	
			var response = new $.preloader.package.responseObject();
			response.errorFiles = $.preloader.private.settings._queueErrorFiles;
			response.successFiles = $.preloader.private.settings._queueReadyFiles;
			$($.preloader.settings.flag).fadeOut(5000,function(){$(this).remove();});
			
			$.preloader.settings.onComplete(response);
			
		},
		rewriteFlag:function(flag){
			flag.removeClass('loading').addClass('error');
			var textFlag = flag.text();
			textFlag = textFlag.replace($.preloader.settings.loadMessage, $.preloader.settings.errorMessage);
			flag.html(textFlag + '<br>');
			
			flag.fadeOut(3000);
		},
		requestError:function(){
			
		}
	};
	
	$.preload = $.fn.preload = function(method) {
		if(typeof method != 'object' && method) {
			return $.preloader.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if( typeof method === 'object' || !method || method == undefined) {
			return $.preloader.methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.tooltip');
		}
	};
})(jQuery);
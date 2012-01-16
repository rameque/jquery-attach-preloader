// JavaScript Document
var my$ = jQuery.noConflict();

my$(document).ready(function(){
	
	var elements = ['images/3469823338.jpg',
					'images/3469823338_a32f7127ec_z.jpg?zz=1',
					'images/6690312801_26b14ce653_z.jpg',
					'services/?url=http://suckitupbuttercup-themovie.attachdesign.com/css/1280x1024.css&cType=css',
					'http://localhost:8888/preloader/text.html',
					'http://webdesign.about.com/od/multimedia/a/mime-types-by-content-type.htm',
					'http://farm8.staticflickr.com/7008/6677850879_b0fa279a5c_o.jpg',
					'js/quality.js'
					];
	
	my$.preload({
		flag:'#flag',
		items:elements,
		onComplete:responseComplete,
		onCompleteItem:responsePreloader,
		//onComplete:responsePreloader,
		inParallelLoad:false
	});
	
	
	my$('#preloader').append('<ul id="preloaderList"></ul>')
	my$.each(elements,function(item,value){
			my$('#preloaderList').append('<li class="loading-white mini-layout-body" id="order-'+(item+1)+'"></li>');
	})
	
});


function responseComplete(items){
	prettyPrint();
}

function responsePreloader(items){

	my$.each(items.successFiles,function(item,value){
		if(value){
			console.log(value.order);
			var list = my$(my$('#order-'+value.order));
			list.append('<span class="label success">Success &raquo;</span> &nbsp; <span class="label success">'+value.src+'</span> &nbsp; ');
			list.removeClass('loading-white');
			list.addClass('success');
			
			if(value.order == 4){
				var result = my$('<pre class="prettyprint linenums lang-css"></pre>').append(value.data);
				list.append(result);
				
			}else if(value.order == 8){
				var result = my$('<pre class="prettyprint linenums lang-js"></pre>').append(value.data);
				list.append(result);
				
			}else{
				list.append(value.data);
			}
		}
	});
	
	my$.each(items.errorFiles,function(item,value){
		if(value){
			console.log(value.order);
			var list = my$(my$('#order-'+value.order));
			list.removeClass('loading-white');
			list.addClass('error');
			list.append('<span class="label important">Error &raquo;</span> &nbsp; ');
			
			var result = my$('<span class="alert-message error"></span>').append(value.src);
			list.append(result);
		}
	});
}
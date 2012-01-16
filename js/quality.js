// JavaScript Document
imb$(document).ready(function() {

	imb$('#certificate a').lightBox({
		imageLoading : path + 'images/lightbox-ico-loading.gif',
		imageBtnPrev : path + 'images/lightbox-btn-prev.gif',
		imageBtnNext : path + 'images/lightbox-btn-next.gif',
		imageBtnClose : path + 'images/lightbox-btn-close.gif',
		imageBlank : path + 'images/lightbox-blank.gif'
	});

	var anchoPadre = parseFloat(imb$("#slider-images ul").parent().css('width'));

	var numberli = imb$("#slider-images li");
	var numberlist = numberli.length;

	var numberCounterChilds = anchoPadre * numberlist;
	imb$("#slider-images ul").css('width', numberCounterChilds);
	var ancho = parseFloat(imb$("#slider-images ul").css('width'));

	var anchoLi = ancho / numberlist;

	imb$("#slider-images li").css('width', anchoLi + 'px');

});

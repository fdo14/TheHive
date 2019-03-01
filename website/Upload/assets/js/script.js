$(function(){
	var imgArray = [];

	var filemanager = $('.filemanager'),
		breadcrumbs = $('.breadcrumbs'),
		fileList = filemanager.find('.data');

	// Start by fetching the file data from scan.php with an AJAX request

	$.get('scan.php', function(data) {

		var response = [data],
			currentPath = '',
			breadcrumbsUrls = [];

		var folders = [],
			files = [];
		

		// This event listener monitors changes on the URL. We use it to
		// capture back/forward navigation in the browser.

		$(window).on('hashchange', function(){

			goto(window.location.hash);

			// We are triggering the event. This will execute 
			// this function on page load, so that we show the correct folder:

		}).trigger('hashchange');


		// Hiding and showing the search box

		filemanager.find('.search').click(function(){

			var search = $(this);

			search.find('span').hide();
			search.find('input[type=search]').show().focus();

		});


		// Listening for keyboard input on the search field.
		// We are using the "input" event which detects cut and paste
		// in addition to keyboard input.

		filemanager.find('input').on('input', function(e){

			folders = [];
			files = [];

			var value = this.value.trim();

			if(value.length) {

				filemanager.addClass('searching');

				// Update the hash on every key stroke
				window.location.hash = 'search=' + value.trim();

			}

			else {

				filemanager.removeClass('searching');
				window.location.hash = encodeURIComponent(currentPath);

			}

		}).on('keyup', function(e){

			// Clicking 'ESC' button triggers focusout and cancels the search

			var search = $(this);

			if(e.keyCode == 27) {

				search.trigger('focusout');

			}

		}).focusout(function(e){

			// Cancel the search

			var search = $(this);

			if(!search.val().trim().length) {

				window.location.hash = encodeURIComponent(currentPath);
				search.hide();
				search.parent().find('span').show();

			}

		});


		// Clicking on folders

		fileList.on('click', 'li.folders', function(e){
			e.preventDefault();

			var nextDir = $(this).find('a.folders').attr('href');

			if(filemanager.hasClass('searching')) {

				// Building the breadcrumbs

				breadcrumbsUrls = generateBreadcrumbs(nextDir);

				filemanager.removeClass('searching');
				filemanager.find('input[type=search]').val('').hide();
				filemanager.find('span').show();
			}
			else {
				breadcrumbsUrls.push(nextDir);
			}

			window.location.hash = encodeURIComponent(nextDir);
			currentPath = nextDir;
		});


		// Clicking on breadcrumbs

		breadcrumbs.on('click', 'a', function(e){
			e.preventDefault();

			var index = breadcrumbs.find('a').index($(this)),
				nextDir = breadcrumbsUrls[index];

			breadcrumbsUrls.length = Number(index);

			window.location.hash = encodeURIComponent(nextDir);

		});


		// Navigates to the given hash (path)

		function goto(hash) {

			hash = decodeURIComponent(hash).slice(1).split('=');

			if (hash.length) {
				var rendered = '';

				// if hash has search in it

				if (hash[0] === 'search') {

					filemanager.addClass('searching');
					rendered = searchData(response, hash[1].toLowerCase());

					if (rendered.length) {
						currentPath = hash[0];
						render(rendered);
					}
					else {
						render(rendered);
					}

				}

				// if hash is some path

				else if (hash[0].trim().length) {

					rendered = searchByPath(hash[0]);

					if (rendered.length) {

						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);

					}
					else {
						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);
					}

				}

				// if there is no hash

				else {
					currentPath = data.path;
					breadcrumbsUrls.push(data.path);
					render(searchByPath(data.path));
				}
			}
		}

		// Splits a file path and turns it into clickable breadcrumbs

		function generateBreadcrumbs(nextDir){
			var path = nextDir.split('/').slice(0);
			for(var i=1;i<path.length;i++){
				path[i] = path[i-1]+ '/' +path[i];
			}
			return path;
		}


		// Locates a file by path

		function searchByPath(dir) {
			var path = dir.split('/'),
				demo = response,
				flag = 0;

			for(var i=0;i<path.length;i++){
				for(var j=0;j<demo.length;j++){
					if(demo[j].name === path[i]){
						flag = 1;
						demo = demo[j].items;
						break;
					}
				}
			}

			demo = flag ? demo : [];
			return demo;
		}


		// Recursively search through the file tree

		function searchData(data, searchTerms) {

			data.forEach(function(d){
				if(d.type === 'folder') {

					searchData(d.items,searchTerms);

					if(d.name.toLowerCase().match(searchTerms)) {
						folders.push(d);
					}
				}
				else if(d.type === 'file') {
					if(d.name.toLowerCase().match(searchTerms)) {
						files.push(d);
					}
				}
			});
			return {folders: folders, files: files};
		}
		
		


		// Render the HTML for the file manager

		function render(data) {

			var scannedFolders = [],
				scannedFiles = [];

			if(Array.isArray(data)) {

				data.forEach(function (d) {

					if (d.type === 'folder') {
						scannedFolders.push(d);
					}
					else if (d.type === 'file') {
						scannedFiles.push(d);
					}

				});

			}
			else if(typeof data === 'object') {

				scannedFolders = data.folders;
				scannedFiles = data.files;

			}


			// Empty the old result and make the new one

			fileList.empty().hide();

			if(!scannedFolders.length && !scannedFiles.length) {
				filemanager.find('.nothingfound').show();
				fileList.hide();
			}
			else {
				filemanager.find('.nothingfound').hide();
				fileList.show();
			}
			

			if(scannedFolders.length) {

				scannedFolders.forEach(function(f) {

					
					var itemsLength = f.items.length,
						name = escapeHTML(f.name),
						icon = '<span class="icon folder"></span>';

					if(itemsLength) {
						icon = '<span class="icon folder full"></span>';
					}

					if(itemsLength == 1) {
						itemsLength += ' item';
					}
					else if(itemsLength > 1) {
						itemsLength += ' items';
					}
					else {
						itemsLength = 'Empty';
					}

					var folder = $('<li class="folders"><a href="'+ f.path +'" title="'+ f.path +'" class="folders">'+icon+'<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>');
					folder.appendTo(fileList);
				});

			}

			if(scannedFiles.length) {

				scannedFiles.forEach(function(f) {

					var fileSize = bytesToSize(f.size),
						name = escapeHTML(f.name),
						fileType = name.split('.'),
						icon = '<span class="icon file"></span>';

					fileType = fileType[fileType.length-1];
					
					if (fileType == "db") {
						return;
					}
					
					

					if (fileType == "jpg") {
						icon = '<div style="display:inline-block;margin:20px 30px 0px 25px;border-radius:8px;width:60px;height:70px;background-position: center center;background-size: cover; background-repeat:no-repeat;background-image: url(\'' + f.path + '\');"></div>';
					} else if (fileType == "jpeg") {
						icon = '<div style="display:inline-block;margin:20px 30px 0px 25px;border-radius:8px;width:60px;height:70px;background-position: center center;background-size: cover; background-repeat:no-repeat;background-image: url(\'' + f.path + '\');"></div>';
					} else if (fileType == "png") {
						icon = '<div style="display:inline-block;margin:20px 30px 0px 25px;border-radius:8px;width:60px;height:70px;background-position: center center;background-size: cover; background-repeat:no-repeat;background-image: url(\'' + f.path + '\');"></div>';
					} else if (fileType == "gif") {
						icon = '<div style="display:inline-block;margin:20px 30px 0px 25px;border-radius:8px;width:60px;height:70px;background-position: center center;background-size: cover; background-repeat:no-repeat;background-image: url(\'' + f.path + '\');"></div>';
					} 
					else {
						icon = '<span class="icon file f-'+fileType+'">.'+fileType+'</span>';
					}
									
					if (fileType == "mp4"){
						var file = $('<li class="files"><a onclick="showVideoModal(\''+f.path+'\')" title="'+ f.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>'); 					
					} else if (fileType == "mp3"){
						var file = $('<li class="files"><a onclick="showSoundModal(\''+f.path+'\')" title="'+ f.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');
					} else if (fileType == "jpg" || fileType == "png"){
						var file = $('<li class="files"><a onclick="showPicModal(\''+f.path+'\')" title="'+ f.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');
					}else if (fileType == "pdf"){
						var file = $('<li class="files"><a onclick="showPdfModal(\''+f.path+'\')" title="'+ f.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');
					}else if (fileType == "docx" || fileType == "doc"){
						var file = $('<li class="files"><a href="'+ f.path +'" title="'+ f.path +'" class="files" download>'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');
					}else if (fileType == "mov"){
						var file = $('<li class="files"><a onclick="showMovModal(\''+f.path+'\')" title="'+ f.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>'); 					
					}					else {
						var file = $('<li class="files"><a href="'+ f.path +'" title="'+ f.path +'" class="files" download>'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');
					}
					file.appendTo(fileList);

				});

				var x;
				var y  = 0;
				for (x = 0; x < scannedFiles.length; x++){
					var fileInQuestion= scannedFiles[x].name;
					var fileinQType = fileInQuestion.split('.');
					fileinQType = fileinQType[fileinQType.length-1];
					if(fileinQType == "jpg" || fileinQType == "png"){
						imgArray[y] = scannedFiles[x].path;
						y++;
					}
					
				}
				window.imgArray = imgArray;
				

					
					
			}

			

		}


		// This function escapes special html characters in names

		function escapeHTML(text) {
			return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
		}


		// Convert file sizes from bytes to human readable units

		function bytesToSize(bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			if (bytes == 0) return '0 Bytes';
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		}
		populateModal();

	
		
		

	});

  		
			

});	
				
			
		
		function populateModal(){
			$(document).ready(function(){		

   			 	for(var z=0 ; z< imgArray.length ; z++) {
    					$('<div class="item" style="text-align: center"><img class="img-responsive center-block" src="'+imgArray[z]+'" /><div class="carousel-caption" style="text-align: right"><a href="'+imgArray[z]+'" download><span class="glyphicon glyphicon-download-alt" style="text-align:left; color: white; width: 100; height:100"></span></a><span class="glyphicon glyphicon-remove" data-dismiss="modal"></span></div>  </div>').appendTo('.carousel-inner');
    					$('<li data-target="#carousel-example-generic" data-slide-to="'+z+'"></li>').appendTo('.carousel-indicators')
  				}
				

			});
		
		}
		function showDocModal(fileLocation){
			window.fileLocation = fileLocation;
			$('#myModal').modal('show');
			document.getElementById("fillModal").innerHTML="<iframe src= '"+fileLocation+"' width='100%' height='800'> </iframe>";
			console.log(fileLocation);
		}
		function showVideoModal(fileLocation){
			window.fileLocation = fileLocation;
			$('#myModal').modal('show');
			document.getElementById("fillModal").innerHTML="<video width='100%'  controls><source src='"+fileLocation+"' type='video/mp4'></video>";
			console.log(fileLocation);
		}
		function showMovModal(fileLocation){
			window.fileLocation = fileLocation;
			$('#myModal').modal('show');
			document.getElementById("fillModal").innerHTML="<video width='100%'  src='"+fileLocation+"' controls></video>";
			console.log(fileLocation);
		}
		function showSoundModal(fileLocation){
			window.fileLocation = fileLocation;
			$('#myModal').modal('show');
			document.getElementById("fillModal").innerHTML="<audio style='width: 100%' controls><source src='"+fileLocation+"' type='audio/mpeg'></audio>";
			console.log(fileLocation);
		}
		function showPdfModal(fileLocation){
			window.fileLocation = fileLocation;
			$('#myModal').modal('show');
			document.getElementById("fillModal").innerHTML="<iframe src='"+fileLocation+"' width='800px' height='800px' />";
			console.log(fileLocation);
		}
		function showPicModal(fileLocation){
			window.fileLocation = fileLocation;
			$('#myModalPics').modal('show');
			var indexOf = imgArray.indexOf(fileLocation);
			indexOf = indexOf + 1;
			for(var q = 0; q < imgArray.length; q++){
				var number;
				number = q+1;
				if($('.item:nth-child('+number+')').hasClass('active')){
					$('.item:nth-child('+number+')').removeClass('active');
					$('.carousel-indicators > li:nth-child('+number+')').removeClass('active');
				}	
			}
			$('.item:nth-child('+indexOf+')').addClass('active');
			$('.carousel-indicators > li:nth-child('+indexOf+')').addClass('active');
  			$('#carousel-example-generic').carousel();
			
			console.log(indexOf);
			
		}





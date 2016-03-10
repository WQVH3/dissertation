// Once this is loaded and parsed, begin execution
loadInterface();

function loadInterface() {
	// Use this to do any one-time page / element construction. For instance, placing any stationary text objects,
	// holding div's, or setting up any nodes which are present for the entire test sequence
	
	// The injection point into the HTML page
	interfaceContext.insertPoint = document.getElementById("topLevelBody");
	var testContent = document.createElement('div');
	testContent.id = 'testContent';
	
	// Create the top div for the Title element
	var titleAttr = specification.title;
	var title = document.createElement('div');
	title.className = "title";
	title.align = "center";
	var titleSpan = document.createElement('span');
	
	// Set title to that defined in XML, else set to default
	if (titleAttr != undefined) {
		titleSpan.textContent = titleAttr;
	} else {
		titleSpan.textContent =  'Listening test';
	}
	// Insert the titleSpan element into the title div element.
	title.appendChild(titleSpan);
	
	var pagetitle = document.createElement('div');
	pagetitle.className = "pageTitle";
	pagetitle.align = "center";
	var titleSpan = document.createElement('span');
	titleSpan.id = "pageTitle";
	pagetitle.appendChild(titleSpan);
	
	// Create Interface buttons!
	var interfaceButtons = document.createElement('div');
	interfaceButtons.id = 'interface-buttons';
	interfaceButtons.style.height = '25px';
	
	// Create playback start/stop points
	var playback = document.createElement("button");
	playback.innerHTML = 'Stop';
	playback.id = 'playback-button';
	playback.style.float = 'left';
	// onclick function. Check if it is playing or not, call the correct function in the
	// audioEngine, change the button text to reflect the next state.
	playback.onclick = function() {
		if (audioEngineContext.status == 1) {
			audioEngineContext.stop();
			this.innerHTML = 'Stop';
            var time = audioEngineContext.timer.getTestTime();
            console.log('Stopped at ' + time); // DEBUG/SAFETY
		}
	};
	// Create Submit (save) button
	var submit = document.createElement("button");
	submit.innerHTML = 'Next';
	submit.onclick = buttonSubmitClick;
	submit.id = 'submit-button';
	submit.style.float = 'left';
	// Append the interface buttons into the interfaceButtons object.
	interfaceButtons.appendChild(playback);
	interfaceButtons.appendChild(submit);
	
	// Create a slider box
	var sliderBox = document.createElement('div');
	sliderBox.style.width = "100%";
	sliderBox.style.height = window.innerHeight - 200+12 + 'px';
	sliderBox.style.marginBottom = '10px';
	sliderBox.id = 'slider';
	var scaleHolder = document.createElement('div');
	scaleHolder.id = "scale-holder";
	scaleHolder.style.marginLeft = "107px";
	sliderBox.appendChild(scaleHolder);
	var scaleText = document.createElement('div');
	scaleText.id = "scale-text-holder";
	scaleText.style.height = "25px";
	scaleText.style.width = "100%";
	scaleHolder.appendChild(scaleText);
	var scaleCanvas = document.createElement('canvas');
	scaleCanvas.id = "scale-canvas";
	scaleCanvas.style.marginLeft = "100px";
	scaleHolder.appendChild(scaleCanvas);
	var sliderObjectHolder = document.createElement('div');
	sliderObjectHolder.id = 'slider-holder';
	sliderObjectHolder.align = "center";
	sliderBox.appendChild(sliderObjectHolder);
	
	// Global parent for the comment boxes on the page
	var feedbackHolder = document.createElement('div');
	feedbackHolder.id = 'feedbackHolder';
	
	testContent.style.zIndex = 1;
	interfaceContext.insertPoint.innerHTML = null; // Clear the current schema
	
	// Inject into HTML
	testContent.appendChild(title); // Insert the title
	testContent.appendChild(pagetitle);
	testContent.appendChild(interfaceButtons);
	testContent.appendChild(sliderBox);
	testContent.appendChild(feedbackHolder);
	interfaceContext.insertPoint.appendChild(testContent);

	// Load the full interface
	testState.initialise();
	testState.advanceState();
};

function loadTest(page)
{
	// Called each time a new test page is to be build. The page specification node is the only item passed in
	var id = page.id;
	
	var feedbackHolder = document.getElementById('feedbackHolder');
    feedbackHolder.innerHTML = null;
    
	var interfaceObj = page.interfaces;
	if (interfaceObj.length > 1)
	{
		console.log("WARNING - This interface only supports one <interface> node per page. Using first interface node");
	}
	interfaceObj = interfaceObj[0];
	if(interfaceObj.title != null)
	{
		document.getElementById("pageTitle").textContent = interfaceObj.title;
	}
	
    var interfaceOptions = specification.interfaces.options.concat(interfaceObj.options);
    for (var option of interfaceOptions)
    {
        if (option.type == "show")
        {
            switch(option.name) {
                case "playhead":
                    var playbackHolder = document.getElementById('playback-holder');
                    if (playbackHolder == null)
                    {
                        playbackHolder = document.createElement('div');
                        playbackHolder.style.width = "100%";
                        playbackHolder.align = 'center';
                        playbackHolder.appendChild(interfaceContext.playhead.object);
                        feedbackHolder.appendChild(playbackHolder);
                    }
                    break;
                case "page-count":
                    var pagecountHolder = document.getElementById('page-count');
                    if (pagecountHolder == null)
                    {
                        pagecountHolder = document.createElement('div');
                        pagecountHolder.id = 'page-count';
                    }
                    pagecountHolder.innerHTML = '<span>Page '+(testState.stateIndex+1)+' of '+testState.stateMap.length+'</span>';
                    var inject = document.getElementById('interface-buttons');
                    inject.appendChild(pagecountHolder);
                    break;
                case "volume":
                    if (document.getElementById('master-volume-holder') == null)
                    {
                        feedbackHolder.appendChild(interfaceContext.volume.object);
                    }
                    break;
            }
        }
    }
    
	// Delete outside reference
	var outsideReferenceHolder = document.getElementById('outside-reference');
	if (outsideReferenceHolder != null) {
		document.getElementById('interface-buttons').removeChild(outsideReferenceHolder);
	}
	
	var sliderBox = document.getElementById('slider-holder');
	sliderBox.innerHTML = null;
	
	var commentBoxPrefix = "Comment on track";
	if (interfaceObj.commentBoxPrefix != undefined) {
		commentBoxPrefix = interfaceObj.commentBoxPrefix;
	}
	var loopPlayback = page.loop;
	
	$(page.commentQuestions).each(function(index,element) {
		var node = interfaceContext.createCommentQuestion(element);
		feedbackHolder.appendChild(node.holder);
	});
	
	// Find all the audioElements from the audioHolder
	var index = 0;
	$(page.audioElements).each(function(index,element){
		// Find URL of track
		// In this jQuery loop, variable 'this' holds the current audioElement.
		
		var audioObject = audioEngineContext.newTrack(element);
		if (element.type == 'outside-reference')
		{
			// Construct outside reference;
			var orNode = new outsideReferenceDOM(audioObject,index,document.getElementById('interface-buttons'));
			audioObject.bindInterface(orNode);
		} else {
			// Create a slider per track
            switch(audioObject.specification.parent.label) {
                case "none":
                    label = "";
                    break;
                case "letter":
                    label = String.fromCharCode(97 + index);
                    break;
                case "capital":
                    label = String.fromCharCode(65 + index);
                    break;
                default:
                    label = ""+index;
                    break;
            }
			var sliderObj = new sliderObject(audioObject,label);
			
			if (typeof page.initialPosition === "number")
			{
				// Set the values
				sliderObj.slider.value = page.initalPosition;
			} else {
				// Distribute it randomnly
				sliderObj.slider.value = Math.random();
			}
			sliderBox.appendChild(sliderObj.holder);
			audioObject.bindInterface(sliderObj);
            interfaceContext.commentBoxes.createCommentBox(audioObject);
			index += 1;
		}
        
	});
	if (page.showElementComments)
    {
        interfaceContext.commentBoxes.showCommentBoxes(feedbackHolder,true);
    }
	// Auto-align
	resizeWindow(null);
}

function sliderObject(audioObject,label)
{
	// An example node, you can make this however you want for each audioElement.
	// However, every audioObject (audioEngineContext.audioObject) MUST have an interface object with the following
	// You attach them by calling audioObject.bindInterface( )
	this.parent = audioObject;
	
	this.holder = document.createElement('div');
	this.title = document.createElement('div');
	this.slider = document.createElement('input');
	this.play = document.createElement('button');
	
	this.holder.className = 'track-slider';
	this.holder.style.width = window.innerWidth-200 + 'px';
	this.holder.appendChild(this.title);
	this.holder.appendChild(this.slider);
	this.holder.appendChild(this.play);
	this.holder.setAttribute('trackIndex',audioObject.id);
	this.title.textContent = label;
	this.title.className = 'track-slider-title';
	
	this.slider.type = "range";
	this.slider.className = "track-slider-range track-slider-not-moved";
	this.slider.min = "0";
	this.slider.max = "1";
	this.slider.step = "0.01";
	this.slider.style.width = window.innerWidth-420 + 'px';
	this.slider.onchange = function()
	{
		var time = audioEngineContext.timer.getTestTime();
		var id = Number(this.parentNode.getAttribute('trackIndex'));
		audioEngineContext.audioObjects[id].metric.moved(time,this.value);
		console.log('slider '+id+' moved to '+this.value+' ('+time+')');
		$(this).removeClass('track-slider-not-moved');
	};
	
	this.play.className = 'track-slider-button';
	this.play.textContent = "Loading...";
	this.play.value = audioObject.id;
	this.play.disabled = true;
    this.play.setAttribute("playstate","ready");
	this.play.onclick = function(event)
	{
		var id = Number(event.currentTarget.value);
		//audioEngineContext.metric.sliderPlayed(id);
        if (event.currentTarget.getAttribute("playstate") == "ready")
        {audioEngineContext.play(id);}
        else if (event.currentTarget.getAttribute("playstate") == "playing")
        {audioEngineContext.stop();}
	};
	this.resize = function(event)
	{
		this.holder.style.width = window.innerWidth-200 + 'px';
		this.slider.style.width = window.innerWidth-420 + 'px';
	};
	this.enable = function()
	{
		// This is used to tell the interface object that playback of this node is ready
		this.play.disabled = false;
		this.play.textContent = "Play";
		$(this.slider).removeClass('track-slider-disabled');
	};
	this.updateLoading = function(progress)
	{
		// progress is a value from 0 to 100 indicating the current download state of media files
	};
    this.startPlayback = function()
    {
        // Called when playback has begun
        this.play.setAttribute("playstate","playing");
        $(".track-slider").removeClass('track-slider-playing');
		$(this.holder).addClass('track-slider-playing');
		var outsideReference = document.getElementById('outside-reference');
		if (outsideReference != null) {
			$(outsideReference).removeClass('track-slider-playing');
		}
    };
    this.stopPlayback = function()
    {
        // Called when playback has stopped. This gets called even if playback never started!
        this.play.setAttribute("playstate","ready");
        $(this.holder).removeClass('track-slider-playing');
    };
	this.getValue = function()
	{
		// Return the current value of the object. If there is no value, return 0
		return this.slider.value;
	};
	this.getPresentedId = function()
	{
		// Return the presented ID of the object. For instance, the APE has sliders starting from 0. Whilst AB has alphabetical scale
		return this.title.textContent;
	};
	this.canMove = function()
	{
		// Return either true or false if the interface object can be moved. AB / Reference cannot, whilst sliders can and therefore have a continuous scale.
		// These are checked primarily if the interface check option 'fragmentMoved' is enabled.
		return true;
	};
	this.exportXMLDOM = function(audioObject) {
		// Called by the audioObject holding this element to export the interface <value> node.
		// If there is no value node (such as outside reference), return null
		// If there are multiple value nodes (such as multiple scale / 2D scales), return an array of nodes with each value node having an 'interfaceName' attribute
		// Use storage.document.createElement('value'); to generate the XML node.
		var node = storage.document.createElement('value');
        node.textContent = this.slider.value;
        return node;
	};
    this.error = function() {
            // audioObject has an error!!
        this.playback.textContent = "Error";
        $(this.playback).addClass("error-colour");
    }
};

function outsideReferenceDOM(audioObject,index,inject)
{
	this.parent = audioObject;
	this.outsideReferenceHolder = document.createElement('button');
	this.outsideReferenceHolder.id = 'outside-reference';
	this.outsideReferenceHolder.className = 'outside-reference';
	this.outsideReferenceHolder.setAttribute('track-id',index);
	this.outsideReferenceHolder.textContent = "Play Reference";
	this.outsideReferenceHolder.disabled = true;
	
	this.outsideReferenceHolder.onclick = function(event)
	{
		audioEngineContext.play(event.currentTarget.getAttribute('track-id'));
	};
	inject.appendChild(this.outsideReferenceHolder);
	this.enable = function()
	{
		if (this.parent.state == 1)
		{
			this.outsideReferenceHolder.disabled = false;
		}
	};
	this.updateLoading = function(progress)
	{
		if (progress != 100)
		{
			progress = String(progress);
			progress = progress.split('.')[0];
			this.outsideReferenceHolder[0].children[0].textContent = progress+'%';
		} else {
			this.outsideReferenceHolder[0].children[0].textContent = "Play Reference";
		}
	};
    this.startPlayback = function()
    {
        // Called when playback has begun
        $('.track-slider').removeClass('track-slider-playing');
        $('.comment-div').removeClass('comment-box-playing');
        $(this.outsideReferenceHolder).addClass('track-slider-playing');
    };
    this.stopPlayback = function()
    {
        // Called when playback has stopped. This gets called even if playback never started!
        $(this.outsideReferenceHolder).removeClass('track-slider-playing');
    };
	this.exportXMLDOM = function(audioObject)
	{
		return null;
	};
	this.getValue = function()
	{
		return 0;
	};
	this.getPresentedId = function()
	{
		return 'reference';
	};
	this.canMove = function()
	{
		return false;
	};
    this.error = function() {
            // audioObject has an error!!
        this.outsideReferenceHolder.textContent = "Error";
        $(this.outsideReferenceHolder).addClass("error-colour");
    }
}

function resizeWindow(event)
{
	// Called on every window resize event, use this to scale your page properly
	
	var numObj = document.getElementsByClassName('track-slider').length;
	var totalHeight = (numObj * 125)-25;
	document.getElementById('scale-holder').style.width = window.innerWidth-220 + 'px';
	var canvas = document.getElementById('scale-canvas');
	canvas.width = window.innerWidth-420;
	canvas.height = totalHeight;
	for (var i in audioEngineContext.audioObjects)
	{
		if (audioEngineContext.audioObjects[i].specification.type != 'outside-reference'){
			audioEngineContext.audioObjects[i].interfaceDOM.resize(event);
		}
	}
    document.getElementById("slider").style.height = totalHeight+50+'px';
	drawScale();
}

function drawScale()
{
	var interfaceObj = testState.currentStateMap.interfaces[0];
	var scales = testState.currentStateMap.interfaces[0].scales;
	scales = scales.sort(function(a,b) {
		return a.position - b.position;
	});
	var canvas = document.getElementById('scale-canvas');
	var ctx = canvas.getContext("2d");
	var height = canvas.height;
	var width = canvas.width;
	var textHolder = document.getElementById('scale-text-holder');
	textHolder.innerHTML = null;
	ctx.fillStyle = "#000000";
	ctx.setLineDash([1,4]);
	for (var scale of scales)
	{
		var posPercent = scale.position / 100.0;
		var posPix = Math.round(width * posPercent);
		if(posPix<=0){posPix=1;}
		if(posPix>=width){posPix=width-1;}
		ctx.moveTo(posPix,0);
		ctx.lineTo(posPix,height);
		ctx.stroke();
		
		var text = document.createElement('div');
		text.align = "center";
		var textC = document.createElement('span');
		textC.textContent = scale.text;
		text.appendChild(textC);
		text.className = "scale-text";
		textHolder.appendChild(text);
		text.style.width = Math.ceil($(text).width())+'px';
		text.style.left = (posPix+100-($(text).width()/2)) +'px';
	}
}

function buttonSubmitClick() // TODO: Only when all songs have been played!
{
	var checks = [];
	checks = checks.concat(testState.currentStateMap.interfaces[0].options);
	checks = checks.concat(specification.interfaces.options);
	var canContinue = true;
	
	// Check that the anchor and reference objects are correctly placed
	if (interfaceContext.checkHiddenAnchor() == false) {return;}
	if (interfaceContext.checkHiddenReference() == false) {return;}
	
	for (var i=0; i<checks.length; i++) {
		if (checks[i].type == 'check')
		{
			switch(checks[i].name) {
			case 'fragmentPlayed':
				// Check if all fragments have been played
				var checkState = interfaceContext.checkAllPlayed();
				if (checkState == false) {canContinue = false;}
				break;
			case  'fragmentFullPlayback':
				// Check all fragments have been played to their full length
				var checkState = interfaceContext.checkAllPlayed();
				if (checkState == false) {canContinue = false;}
				console.log('NOTE: fragmentFullPlayback not currently implemented, performing check fragmentPlayed instead');
				break;
			case 'fragmentMoved':
				// Check all fragment sliders have been moved.
				var checkState = interfaceContext.checkAllMoved();
				if (checkState == false) {canContinue = false;}
				break;
			case 'fragmentComments':
				// Check all fragment sliders have been moved.
				var checkState = interfaceContext.checkAllCommented();
				if (checkState == false) {canContinue = false;}
				break;
			//case 'scalerange':
				// Check the scale is used to its full width outlined by the node
				//var checkState = interfaceContext.checkScaleRange();
				//if (checkState == false) {canContinue = false;}
			//	break;
			default:
				console.log("WARNING - Check option "+checks[i].check+" is not supported on this interface");
				break;
			}

		}
		if (!canContinue) {break;}
	}
	
    if (canContinue) {
	    if (audioEngineContext.status == 1) {
	        var playback = document.getElementById('playback-button');
	        playback.click();
	    // This function is called when the submit button is clicked. Will check for any further tests to perform, or any post-test options
	    } else
	    {
	        if (audioEngineContext.timer.testStarted == false)
	        {
	            alert('You have not started the test! Please press start to begin the test!');
	            return;
	        }
	    }
	    testState.advanceState();
    } 
}

function pageXMLSave(store, pageSpecification)
{
	// MANDATORY
	// Saves a specific test page
	// You can use this space to add any extra nodes to your XML <audioHolder> saves
	// Get the current <page> information in store (remember to appendChild your data to it)
	// pageSpecification is the current page node configuration
	// To create new XML nodes, use storage.document.createElement();
}
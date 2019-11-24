$( document ).ready(function() {

	// For symetry's sake keep it a multple of 2
	let colorArray = [
		'black',
		'#00fafa',
		'blue',
		'salmon',
		'pink',
		'yellow',
		'green',
		'grey',
		'lightgrey',
		'red',
		'#faf00f',
		'#ef10ff',
	];

	const $body = $( 'body' );
	const $menuTop = $( '.float-menu-top' );
	const $canvasContainer = $( '.canvas-container' );

	// Add svg to document
	let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	$canvasContainer.append(svg);

	const $svg = $( 'svg' );

	const canvasProperties = {
		height: '100%',
		width: '100%',
	};

	const polylineProperties = {
		stroke: 10,
		color: 'black',
		strokeLinecap: 'round',
	};

	$svg.addClass('canvas');

	const canvas = document.querySelector('.canvas');

	let prevX = 0;
	let prevY = 0;

	function adjustMousePosition(event) {
		let canvasBounds = canvas.getBoundingClientRect();

		let x = event.pageX - canvasBounds.left - window.scrollX;
		let y = event.pageY - canvasBounds.top - window.scrollY;

		x /= canvasBounds.width;
		y /= canvasBounds.height;

		x *= canvas.width.animVal.value;
		y *= canvas.height.animVal.value;

		return [x, y];
	}

	function addLineToCanvas(e) {
		let posXY = adjustMousePosition(e);
		let posXorigin = posXY[0];
		let posYorigin = posXY[1];

		let tempPol = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
		$svg.append(tempPol);
		
		polyline = document.querySelector( 'svg' ).lastElementChild;

		polyline.setAttribute('points', `${posXorigin},${posYorigin} ${posXorigin},${posYorigin}`);

		polyline.style.strokeWidth = polylineProperties.stroke;
		polyline.style.stroke = polylineProperties.color;
		polyline.style.strokeLinecap = polylineProperties.strokeLinecap;
	}

	function drawLine(e) {

		let posXY = adjustMousePosition(e);
		let posX = posXY[0];
		let posY = posXY[1];

		polyline.attributes[0].value += ` ${posX},${posY}`;
	}

	// Start drawing
	$svg.mousedown(function(e) {
		e.preventDefault();
		addLineToCanvas(e);

		$svg.on('mousemove', drawLine);

		document.addEventListener('mouseleave', () => $svg.off('mousemove', drawLine));
	});

	// Stop drawing
	$body.mouseup(() => {
		$svg.off('mousemove', drawLine);
	});

//Component general functions
	function changeBrushSize(newSize) {
		polylineProperties.stroke = newSize;
	}

	function changeBrushColor(newColor) {
		polylineProperties.color = newColor;
	}

	function changeCanvasSize() {
		$svg.css(canvasProperties);
	}

	function undo() {
		$( 'polyline' ).last().remove();
	}

	function reset() {
		$svg.html('');
	}
	//Get value of color label to use it as stroke color
	function getLabel(id){
		return $( `#${id}` ).html();
	}

	function changePreviewColor(id, newColor) {
		$( `#${id}` ).css('background-color', newColor);
	}


	function createColorPalette(arrayOfColors) {
		let i = 0;
		for (color of arrayOfColors) {

			$menuTop.append($( '<div>', {
					class: 'color-container', 
					id: `color-item-${i}`,
				}));

			let $colorItem = $( '.color-container' ).eq(-1);
			$colorItem.append($( '<div>', {
					class: 'color-prev',
					id: `color-prev-${i}`,
				}));
			$colorItem.append($( '<label>', {
				class: 'color-label',
				id: `color-lab-${i}`,
			}));
			changePreviewColor($( '.color-prev' )[i].id, colorArray[i])
			
			$( '.color-label' )[i].append(colorArray[i]);

			i++;
		}
		$( '#color-prev-0' ).addClass('active');
		$( '#color-lab-0' ).addClass('active');
	}

	createColorPalette(colorArray);
	

	// Event listener ==> range sliders (h, v) to resize canvas
	$( '.canvas-area-container input' ).on('input', function(e) {
		if (e.target.id === 'h') {
			canvasProperties.width = $( this ).val() + "%";
		} else {
			canvasProperties.height = $( this ).val() + "%";
		}
		changeCanvasSize();
	});

	const $colorLabels = $( '.color-label' );
	$colorLabels.each(function() {this.setAttribute('contenteditable', true)});
	
// Event-listeners

	// Change colors based on input
	$colorLabels.on('input', function(e) {
		let color = getLabel(e.target.id);
	 	changePreviewColor(e.target.previousSibling.id, color);
	 	polylineProperties.color = color;
	});

	// Change color preview based on label
	// Handles selected color and toggle eraser
	const $colorPrev = $( '.color-prev' );
	$colorPrev.on('click', function(e) {
		polylineProperties.color = getLabel(e.target.nextSibling.id);
		$colorPrev.removeClass('active');
		$colorPrev.siblings().removeClass('active');
		$( this ).addClass('active');
		$( this ).siblings().addClass('active');

		$( '#eraser' ).removeClass('active');
	});

	$( '#reset' ).click(e => {
		e.preventDefault();
		reset();
	});
	$( '#undo' ).click(e => {
		e.preventDefault();
		undo();
	});

	//Toggles brush menu (handles invidiual items as well)
	$( '#brush' ).click(function(e) {
		e.preventDefault();
		$( this ).toggleClass('active');
		$( '.float-menu-btm-2' ).slideToggle();
		$('.brush-shapes').slideToggle('medium', function() {
		    if ($( this ).is(':visible')) {
		        $( this ).css({
		        	display: 'flex',
		        	justifyContent: 'space-around',
		        });
			}
		});
		$( '.brush-size' ).slideToggle();
	});

	// Toggle active shape (square or round)
	$( '.brush-shapes .link-item' ).click(function(e) {
		e.preventDefault()
		$( '.brush-shapes .link-item' ).removeClass('active');
		$( this ).addClass('active');

		polylineProperties.strokeLinecap = e.target.id;
	});

	$( '.brush-size input' ).on('input', function() {
		polylineProperties.stroke = $( this )[0].value;
	});

	// Sets eraser as active
	$( '#eraser' ).click(function(e) {
		e.preventDefault();
		$( this ).addClass('active');
		$colorPrev.removeClass('active');
		$colorLabels.removeClass('active');
		polylineProperties.color = 'white';
	});
});
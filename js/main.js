$( document ).ready(function() {
	$menuTop = $( '.float-menu-top' );

	colorArray = [
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

	let $body = $( 'body' );
	let $canvasContainer = $( '.canvas-container' );

	const canvasProperties = {
		height: '100%',
		width: '100%',
	}

	const polylineProperties = {
		stroke: 10,
		color: 'black',
		strokeLinecap: 'round',
	}

	let prevX = 0;
	let prevY = 0;

	// Add svg to document
	let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	$canvasContainer.append(svg)

	let $svg = $( 'svg' );
	$svg.addClass('canvas');

	const canvas = document.querySelector('.canvas');

	function adjustMouse(event) {
		let canvasBounds = canvas.getBoundingClientRect();

		let x = event.pageX - canvasBounds.left - window.scrollX;
		let y = event.pageY - canvasBounds.top - window.scrollY;

		x /= canvasBounds.width;
		y /= canvasBounds.height;

		x *= canvas.width.animVal.value;
		y *= canvas.height.animVal.value;

		return [x, y];
	}

	// Start drawing
	$svg.mousedown(function(e) {
		e.preventDefault();
		addLine(e);

		$svg.on('mousemove', drawLine);

		document.addEventListener('mouseleave', () => $svg.off('mousemove', drawLine))
	});

	function addLine(e) {
		let posXY = adjustMouse(e);
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

		let posXY = adjustMouse(e);
		let posX = posXY[0];
		let posY = posXY[1];

		polyline.attributes[0].value += ` ${posX},${posY}`;
	}

	// Stop drawing
	$body.mouseup(() => {
		$svg.off('mousemove', drawLine);
	});

	function changeBrushSize(newSize) {
		polylineProperties.stroke = newSize;
	}

	function changeBrushColor(newColor) {
		polylineProperties.color = newColor;
	}

	function changeBrushShape(newShape) {

	}

	function changeCanvasSize() {
		$svg.css(canvasProperties)
	}


	function undo() {
		$( 'polyline' ).last().remove();
	}

	function reset() {
		$svg.html('')
	}

	$( '.canvas-area-container input' ).on('input', function(e) {
		if (e.target.id === 'h') {
			canvasProperties.width = $( this ).val() + "%";
		} else {
			canvasProperties.height = $( this ).val() + "%";
		}
		changeCanvasSize()
	});


	function createColors(arrayOfColors) {
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
			changePrevColor($( '.color-prev' )[i].id, colorArray[i])
			
			$( '.color-label' )[i].append(colorArray[i]);

			i++;
		}
		$( '#color-prev-0' ).addClass('active');
		$( '#color-lab-0' ).addClass('active');
	}


	function getLabel(id){
		return $( `#${id}` ).html()
	}

	function changePrevColor(id, newColor) {
		$( `#${id}` ).css('background-color', newColor);

	}

	createColors(colorArray);

	const $colorLabels = $( '.color-label' );
	$colorLabels.each(function() {this.setAttribute('contenteditable', true)});
	
	// Event-listeners

	// Change colors based on input
	$colorLabels.on('input', function(e) {
		let color = getLabel(e.target.id);
	 	changePrevColor(e.target.previousSibling.id, color);
	 	polylineProperties.color = color;
	});

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
	$( '#brush' ).click(function(e) {
		e.preventDefault();
		$( this ).toggleClass('active');
		$( '.float-menu-btm-2' ).slideToggle();
		$('.brush-shapes').slideToggle('medium', function() {
	    if ($( this ).is(':visible'))
	        $( this ).css({
	        	display: 'flex',
	        	justifyContent: 'space-around',
	    });
		});;
		$('.brush-size').slideToggle();

	});
	$( '.brush-shapes .link-item' ).click(function(e) {
		e.preventDefault()
		$( '.brush-shapes .link-item' ).removeClass('active');
		$( this ).addClass('active');

		polylineProperties.strokeLinecap = e.target.id;
	});
	$( '.brush-size input' ).on('input', function() {
		polylineProperties.stroke = $( this )[0].value;
	});
	$( '#eraser' ).click(function(e) {
		e.preventDefault();
		$( this ).addClass('active');
		$colorPrev.removeClass('active');
		$colorLabels.removeClass('active');
		polylineProperties.color = 'white';
	});
});
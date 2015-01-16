(function($) {
	$.fn.videoPlayer = function(options) {
		var settings = {
			playerWidth: '0.95', // Default is 95%
			videoClass: 'video' // Video Class
		}

		if (options) {
			$.extend(settings, options);
		}
		return this.each(function() {
			if (settings.src !== undefined && settings.src !== '') {
				$(this).attr('src', settings.src);
			}

			$(this)[0].addEventListener('loadedmetadata', function() {
				var $this = $(this);
				var $settings = settings;

				$this.wrap('<div class="' + $settings.videoClass + '"></div>');

				var $that = $this.parent('.' + $settings.videoClass);

				{
					$('<div class="player">' + '<div class="play-pause play">' + '<span class="play-button">&#9658;</span>' + '<div class="pause-button">' + '<span> </span>' + '<span> </span>' + '</div>' + '</div>' + '<div class="progress">' + '<div class="progress-bar">' + '<div class="button-holder">' + '<div class="progress-button"> </div>' + '</div>' + '</div>' + '</div>' + '<div class="time">' + '<span class="ctime">00:00</span>' + '<span class="stime"> / </span>' + '<span class="ttime">00:00</span>' + '</div>' + '<div class="fullscreen"> ' + '<a href="#"> </a>' + '</div>' + '<div class="volume">' + '<div class="volume-holder">' + '<div class="volume-bar-holder">' + '<div class="volume-bar">' + '<div class="volume-button-holder">' + '<div class="volume-button"> </div>' + '</div>' + '</div>' + '</div>' + '</div>' + '<div class="volume-icon v-change-0">' + '<span> </span>' + '</div>' + '</div>' + '</div>').appendTo($that);
				}
				$this.css('display', 'block');

				$videoWidth = $this.width();
				$that.width($videoWidth + 'px');

				$that.find('.player').css({
					'width': ($settings.playerWidth * 100) + '%',
					'left': ((100 - $settings.playerWidth * 100) / 2) + '%'
				});

				var $spc = $(this)[0],
					$duration = $spc.duration,
					$volume = $spc.volume,
					currentTime;

				var $mclicking = false,
					$vclicking = false,
					$vidhover = false,
					$volhover = false,
					$playing = false,
					$drop = false,
					$begin = false,
					$draggingProgress = false,
					$storevol,
					x = 0,
					y = 0,
					vtime = 0,
					updProgWidth = 0,
					volume = 0;

				var $volume = $spc.volume;

				$that.bind('selectstart', function() {
					return false;
				});

				var progWidth = $that.find('.progress').width();
				var myProgWidth = $that.find('.myProgress').width();

				$('#close').bind("click", function() {
					$('#show').removeClass('showShow').addClass('#showHide');
					$('#show').css({
						'visibility': 'hidden'
					});
					$('#show').animate({
						'left': '100%'
					}, 500);


					$('.main-page').removeClass('main-move').removeClass('move');
					$('.main-page').addClass('main-back').addClass('move');
					setTimeout(function() {
						$begin = true;
						$spc.play();
						$that.find('play-pause').addClass('pause').removeClass('play');
					}, 1000);
				});

				var bufferLength = function() {
					var buffered = $spc.buffered;
					$that.find('[class^=buffered]').remove();

					if (buffered.length > 0) {

						var i = buffered.length;

						while (i--) {
							$maxBuffer = buffered.end(i);
							$minBuffer = buffered.start(i);

							var bufferOffset = ($minBuffer / $duration) * 100;
							var bufferWidth = (($maxBuffer - $minBuffer) / $duration) * 100;

							$('<div class="buffered"></div>').css({
								"left": bufferOffset + '%',
								'width': bufferWidth + '%'
							}).appendTo($that.find('.progress'));
							$('<div class="buffered"></div>').css({
								"left": bufferOffset + '%',
								'width': bufferWidth + '%'
							}).appendTo($that.find('.myProgress'));
						}
					}
				}

				bufferLength();

				var timeUpdate = function($ignore) {

					var time = Math.round(($('.progress-bar').width() / progWidth) * $duration);

					var curTime = $spc.currentTime;

					var seconds = 0,
						minutes = Math.floor(time / 60),
						tminutes = Math.floor($duration / 60),
						tseconds = Math.round(($duration) - (tminutes * 60));
					if (time) {
						seconds = Math.round(time) - (60 * minutes);

						if (seconds > 59) {
							seconds = Math.round(time) - (60 * minutes);
							if (seconds == 60) {
								minutes = Math.round(time / 60);
								seconds = 0;
							}
						}

					}

					updProgWidth = (curTime / $duration) * progWidth;
					updMyProgWidth = (curTime / $duration) * myProgWidth;

					if (seconds < 10) {
						seconds = '0' + seconds;
					}
					if (tseconds < 10) {
						tseconds = '0' + tseconds;
					}

					if ($ignore != true) {
						$that.find('.progress-bar').css({
							'width': updProgWidth + 'px'
						});
						$that.find('.progress-button').css({
							'left': (updProgWidth - $that.find('.progress-button').width()) + 'px'
						});

						$that.find('.myProgress-bar').css({
							'width': updMyProgWidth + 'px'
						});
						$that.find('.myProgress-button').css({
							'left': (updMyProgWidth - $that.find('.progress-button').width()) + 'px'
						});
					}

					$that.find('.ctime').html(minutes + ':' + seconds);
					$that.find('.ttime').html(tminutes + ':' + tseconds);

					if ($spc.currentTime > 0 && $spc.paused == false && $spc.ended == false) {
						bufferLength();
					}

				}

				timeUpdate();
				$spc.addEventListener('timeupdate', timeUpdate);

				var playEvent = function(e) {
					e.stopPropagation();
					if ($spc.currentTime > 0 && $spc.paused == false && $spc.ended == false) {
						$playing = false;
					} else {
						$playing = true;
					}

					$begin = true;
					$spc.play();
					$('.play-pause').addClass('pause').removeClass('play');
					bufferLength();
				}
				var pauseEvent = function(e) {
					e.stopPropagation();

					if ($spc.currentTime > 0 && $spc.paused == false && $spc.ended == false) {
						$playing = false;
					} else {
						$playing = true;
					}

					$spc.pause();
					$('.play-pause').addClass('play').removeClass('pause');
					bufferLength();
				}
				$that.find('.play-button').bind('click', playEvent);

				$that.find('.pause-button').bind('click', pauseEvent);

				$that.find('video').bind('click', function(e) {
					if ($playing) {
						pauseEvent(e)
					} else {
						playEvent(e)
					}
				});

				$that.find('.progress').bind('mousedown', function(e) {

					$mclicking = true;

					if ($playing == true) {
						$spc.pause();
					}

					x = e.pageX - $that.find('.progress').offset().left;

					currentTime = (x / progWidth) * $duration;

					$spc.currentTime = currentTime;

				});

				$that.find('.volume-bar-holder').bind('mousedown', function(e) {

					$vclicking = true;

					y = (e.pageX - $that.find('.volume-bar-holder').offset().left);

					if (y < 0 || y > $(this).width()) {
						$vclicking = false;
						return false;
					}

					$that.find('.volume-bar').css({
						'width': y + 'px'
					});
					$that.find('.volume-button').css({
						'left': y + (($that.find('.volume-button').width() / 2)) + 'px'
					});

					$spc.volume = $that.find('.volume-bar').width() / $(this).width();
					$storevol = $that.find('.volume-bar').width() / $(this).width();
					$volume = $that.find('.volume-bar').width() / $(this).width();

					volanim();

				});

				var volanim = function() {

						for (var i = 0; i < 1; i += 0.1) {

							var fi = parseInt(Math.floor(i * 10)) / 10;
							var volid = (fi * 10) + 1;

							if ($volume == 1) {
								if ($volhover == true) {
									$that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-11');
								} else {
									$that.find('.volume-icon').removeClass().addClass('volume-icon v-change-11');
								}
							} else if ($volume == 0) {
								if ($volhover == true) {
									$that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-1');
								} else {
									$that.find('.volume-icon').removeClass().addClass('volume-icon v-change-1');
								}
							} else if ($volume > (fi - 0.1) && volume < fi && !$that.find('.volume-icon').hasClass('v-change-' + volid)) {
								if ($volhover == true) {
									$that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-' + volid);
								} else {
									$that.find('.volume-icon').removeClass().addClass('volume-icon v-change-' + volid);
								}
							}

						}
					}
				volanim();

				$that.find('.volume').hover(function() {
					$volhover = true;
				}, function() {
					$volhover = false;
				});

				$that.bind('mousemove', function(e) {

					if ($begin == true) {
						$that.hover(function() {
							$that.find('.player').stop(true, false).animate({
								'opacity': '1'
							}, 0.5);
						}, function() {
							$playing && $that.find('.player').stop(true, false).animate({
								'opacity': '0'
							}, 0.5);
						});
					}

					if ($mclicking == true) {

						$draggingProgress = true;
						var progMove = 0;
						var buttonWidth = $that.find('.progress-button').width();

						x = e.pageX - $that.find('.progress').offset().left;

						if ($playing == true) {
							if (currentTime < $duration) {
								$that.find('.play-pause').addClass('pause').removeClass('play');
							}
						}

						if (x < 0) { 
							progMove = 0;
							$spc.currentTime = 0;
						} else if (x > progWidth) {
							$spc.currentTime = $duration;
							progMove = progWidth;
						} else { 
							progMove = x;
							currentTime = (x / progWidth) * $duration;
							$spc.currentTime = currentTime;
						}

						$that.find('.progress-bar').css({
							'width': progMove + 'px'
						});
						$that.find('.progress-button').css({
							'left': (progMove - buttonWidth) + 'px'
						});

					}

					if ($vclicking == true) {

						y = (e.pageX - $that.find('.volume-bar-holder').offset().left);

						var volMove = 0;

						if ($that.find('.volume-holder').css('display') == 'none') {
							$vclicking = false;
							return false;
						}

						if (!$that.find('.volume-icon').hasClass('volume-icon-hover')) {
							$that.find('.volume-icon').addClass('volume-icon-hover');
						}


						if (y < 0 || y == 0) {

							$volume = 0;
							volMove = 0;

							$that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-11');

						} else if (y > $(this).find('.volume-bar-holder').width() || (y / $that.find('.volume-bar-holder').width()) == 1) {

							$volume = 1;
							volMove = $that.find('.volume-bar-holder').width();

							$that.find('.volume-icon').removeClass().addClass('volume-icon volume-icon-hover v-change-1');

						} else { 

							$volume = $that.find('.volume-bar').width() / $that.find('.volume-bar-holder').width();
							volMove = y;

						}

						$that.find('.volume-bar').css({
							'width': volMove + 'px'
						});
						$that.find('.volume-button').css({
							'left': (volMove + $that.find('.volume-button').width() / 2) + 'px'
						});

						volanim();

						$spc.volume = $volume;
						$storevol = $volume;


					}

					if ($volhover == false) {
						$that.find('.volume-icon').removeClass('volume-icon-hover');
					} else {
						$that.find('.volume-icon').addClass('volume-icon-hover');
					}

				})

				$spc.addEventListener('ended', function() {

					$playing = false;

					if ($draggingProgress == false) {
						$that.find('.play-pause').addClass('play').removeClass('pause');
					}
				});

				$that.find('.volume-icon').bind('mousedown', function() {

					$volume = $spc.volume;

					if (typeof $storevol == 'undefined') {
						$storevol = $spc.volume;
					}

					if ($volume > 0) {
						$spc.volume = 0;
						$volume = 0;
						$that.find('.volume-bar').css({
							'width': '0'
						});
						volanim();
					} else {
						$spc.volume = $storevol;
						$volume = $storevol;
						$that.find('.volume-bar').css({
							'width': ($storevol * 100) + '%'
						});
						volanim();
					}
				});

				var outEvent = function(e) {
					e.stopPropagation();
					$mclicking = false;
					$vclicking = false;
					$draggingProgress = false;

					if ($playing == true) {
						$spc.play();
					}

					bufferLength();
				}

				$that.bind('mouseup mouseleave', outEvent);

				if (!$spc.requestFullscreen && !$spc.mozRequestFullScreen && !$spc.webkitRequestFullScreen) {
					$('.fullscreen').hide();
				}

				$('.fullscreen > a').bind('click', function() {

					if ($spc.requestFullscreen) {
						$spc.requestFullscreen();
					} else if ($spc.mozRequestFullScreen) {
						$spc.mozRequestFullScreen();
					} else if ($spc.webkitRequestFullScreen) {
						$spc.webkitRequestFullScreen();
					}

				});
			});
		});
	}
})(jQuery);
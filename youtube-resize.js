var player,
    playerContainer,
    theaterBackground,
    sidebarContainer,
    camelCase = function(input) { 
        return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    },
    getExtendedElementById = function(id) {
        var idName = camelCase(id),
            element;

        // This strange juggling of the player object is necessary to get access to the YouTube API's methods
        unsafeWindow[idName] = document.getElementById(id);
        element = unsafeWindow[idName];
        element.currentClass;

        element.addClass = function(newClassName) {
            if (!this.classList.contains(newClassName)) {
                this.classList.add(newClassName);
            }
        };

        element.removeClass = function(classToRemove) {
            if (this.classList.contains(classToRemove)) {
                this.classList.remove(classToRemove);
            }
        }

        element.resize = function(playbackQuality) {
            this.removeClass('player-width');
            this.removeClass('player-height');
            this.removeClass(this.currentClass);
            this.currentClass = playbackQuality;
            this.addClass(playbackQuality);
        };

        element.manuallyCenter = function() {
            var leftMargin = (document.body.clientWidth - this.offsetWidth) / 2;
            this.style.position = 'relative';
            this.style.left = leftMargin + 'px';
        }

        return element;
    },
    resizeVideo = function(quality) {
        playerContainer.resize(quality);
        theaterBackground.resize(quality);
    },
    centerPlayer = function() {
        // Keep video propery centered at smaller window sizes
        if (window.innerWidth < 1003) {
            playerContainer.removeClass('center');
            playerContainer.manuallyCenter();
        } else {
            playerContainer.style.left = 0;
            playerContainer.addClass('center');
        }
    },
    onQualityChange = function(suggestedQuality) {
        resizeVideo(player.getPlaybackQuality());
        centerPlayer();
    },
    onYouTubePlayerReady = function(playerId) {
        player = getExtendedElementById('movie_player');

        playerContainer = getExtendedElementById('player-api');
        theaterBackground = getExtendedElementById('theater-background');
        sidebarContainer = getExtendedElementById('watch7-main-container');

        window.onresize = centerPlayer;

        // Prevent watch-wide class from being removed from the sidebar because it can block the video at certain resolutions
        sidebarContainer.addEventListener('DOMAttrModified', function() {
            if (!sidebarContainer.classList.contains('watch-wide')) {
                sidebarContainer.addClass('watch-wide');
            }
        });

        // This syntax is different because YouTube's API overwrote the addEventListener method for the player, the second argument must be a string referencing a function on the page's window scope which is done with the exposeFunction method below
        player.addEventListener('onPlaybackQualityChange', 'onQualityChange');

        playerContainer.addClass('center');
        sidebarContainer.addClass('watch-wide');

        // Remove extra player frame that was recently added
        getExtendedElementById('placeholder-player').remove();
        window.dispatchEvent(resize);

        resizeVideo(player.getPlaybackQuality());
        centerPlayer();
    };


// The page calls these functions, so they must be exposed to the page
exportFunction(onYouTubePlayerReady, unsafeWindow, {
    defineAs: 'onYouTubePlayerReady'
});

exportFunction(onQualityChange, unsafeWindow, {
    defineAs: 'onQualityChange'
});
const newStyle = document.createElement('style');
    newStyle.innerText = `
        .scroll-arrow {
            display: none !important;
        }
        .ui-mode-pointer .games-list.games-list {
            height: auto !important;
        }
        .ui-mode-pointer .games-list.games-list .slider {
            height: auto !important;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            transform: none !important;
        }
        .ui-mode-pointer .games-list-tile.games-list-tile.games-list-tile {
            width: 100%;
            height: 100%;
            margin: 0;
        }
        #psp-toolbar {
            display: flex;
            position: sticky;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
            padding: 10px;
            width: 100%;
            right: 5px;
            z-index: 14;
            order: -1;
        }
        .psp-search-bar {
            position: relative;
            display: block;
            padding: 1em;
            width: 300px;
            border-radius: 6px;
        }
        #psp-settings-btn {
            position: relative;
            font-size: 1.2em;
            background: none;
            margin: 10px;
            color: white;
            border: none;
            cursor: pointer;
        }
        .ui-mode-pointer.ui-mode-pointer .category-tile>.title {
            padding: 2em 1.2em;
            position: sticky;
            background: inherit;
            z-index: 13;
        }
        .ui-mode-pointer.ui-mode-pointer .category-tile {
            background: #222;
        }
        .ui-mode-pointer.ui-mode-pointer .category-tile:nth-child(odd) {
            background: #333;
        }
        .catalog-list {
            padding-top: 53px;
            display: flex;
            flex-direction: column;
        }
        .focus-highlight {
        z-index: 10;
        }
        html body .full-screen .detail.overview.pointer .game-info .hero {
            z-index: -1!important;
        }
        .MYLIST {
            order: -1;
        }
        .PLAYHISTORY {
            order: -1;
        }
        .games-list-tile[data-game-platform]::after {
            position: absolute;
            content: attr(data-game-platform);
            bottom: 0;
            left: 0;
            display: inline-block;
        }
        html body .games-list-tile {
            display: none !important;
        }
        html body .games-list-tile.visible {
            display: block !important;
        }
        html body .games-list-tile.controller {
            display: block !important;
        }
        html {
            background-color: #05090d;
        }
        html body .ui-mode-pointer .catalog-list .full-bleed-bg {
            background: linear-gradient(
                to bottom,
                rgb(6, 55, 145) 0%,     /* Top: Deep Navy */
                rgb(8, 30, 59) 50%,     /* Middle: Darker Navy */
                rgb(5, 9, 13) 100%      /* Bottom: #05090d */
            );
        }
    `;

    function startHeaderSyncLoop() {
        const dragRegion = document.querySelector('.drag-region');
        const toolbar = document.querySelector('#psp-toolbar');
        const categoryTitles = document.querySelectorAll('.ui-mode-pointer.ui-mode-pointer .category-tile > .title');
    
        setInterval(() => {
            if (!dragRegion) return;
    
            //NEW fullscreen detection: only true if .psplus-icon is present in the DOM
            const isFullscreen = !!document.querySelector('.psplus-icon');
    
            const header = dragRegion.closest('.app-header, .app-chrome, .ember-view');
            const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    
            // Use live header position in fullscreen, and offset-adjusted in windowed/maximized
            const toolbarTop = isFullscreen ? headerBottom : (headerBottom - 50);
            const titleTop = isFullscreen ? headerBottom : (headerBottom - 50);
    
            if (toolbar) {
                toolbar.style.top = `${toolbarTop}px`;
            }
    
            categoryTitles.forEach(title => {
                title.style.top = `${titleTop}px`;
            });
        }, 25);
    }

    // Top-level helper
    function PSPP_AssignCategoryIds(categories) {
        const preferredOrder = ["Your List", "Play History"];
    
        categories.sort((a, b) => {
            const titleA = a.querySelector('h1')?.textContent.trim();
            const titleB = b.querySelector('h1')?.textContent.trim();
    
            const indexA = preferredOrder.indexOf(titleA);
            const indexB = preferredOrder.indexOf(titleB);
    
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });
    
        categories.forEach((catDiv, index) => {
            const wrapper = catDiv.closest('.tile-wrapper') || catDiv;
            wrapper.id = `category-${index}`;
        });
    }
    
    const PSPP_WaitForCatalogListLoad = () => {
        // Observe DOM mutations (changes to the structure)
        const mobserver = new MutationObserver(async () => {
            const catalogList = document.querySelector(".catalog-list");

            // Check if catalog list is loaded
            if (catalogList) {
                // Remove observer
                mobserver.disconnect();
                // Create input for search

                const wrapper = document.createElement('div');
                wrapper.id = 'psp-toolbar';

                const input = document.createElement('input');
                input.classList.add('psp-search-bar');
                input.placeholder = 'Search (loading...)';
                
                // Your original nav building
                const categories = Array.from(document.querySelectorAll('.category-tile'));
                
                // Create the nav container
                const categoryNav = document.createElement('div');
                categoryNav.id = 'psp-category-nav';
                categoryNav.style.display = 'flex';
                categoryNav.style.flexWrap = 'wrap';
                categoryNav.style.width = '50%';
                categoryNav.style.gap = '8px';
                categoryNav.style.marginLeft = '10px';
                
                // ✅ Reassign category IDs first (sorting happens here too!)
                PSPP_AssignCategoryIds(categories);
                
                // Now build the nav links
                categories.forEach((catDiv, index) => {
                    const h1 = catDiv.querySelector('h1');
                    if (h1 && h1.textContent.trim()) {
                        const title = h1.textContent.trim();
                
                        const wrapper = catDiv.closest('.tile-wrapper') || catDiv;
                        const id = wrapper.id; // use already-assigned ID
                
                        const link = document.createElement('a');
                        link.href = `#${id}`;
                        link.textContent = title;
                        link.style.cursor = 'pointer';
                        link.style.margin = '2px';
                        link.style.textDecoration = 'none';
                        link.style.padding = '4px 8px';
                        link.style.background = '#333';
                        link.style.color = '#fff';
                        link.style.borderRadius = '4px';
                        link.style.fontSize = '0.9rem';
                
                        categoryNav.appendChild(link);
                    }
                });
                
                // Add the nav to your wrapper
                wrapper.appendChild(categoryNav);
                
                //Upgraded click system
                let activeCategoryId = null; // track currently active
                
                categoryNav.addEventListener('click', (e) => {
                    if (e.target.tagName.toLowerCase() !== 'a') return;
                    e.preventDefault();
                
                    const id = e.target.getAttribute('href').replace('#', '');
                    const allCategories = document.querySelectorAll('.category-tile');
                    const allLinks = categoryNav.querySelectorAll('a');
                
                    if (activeCategoryId === id) {
                        // Already selected -> unselect and show all
                        activeCategoryId = null;
                
                        allCategories.forEach(cat => {
                            const wrapper = cat.closest('.tile-wrapper') || cat;
                            wrapper.style.display = 'block';
                        });
                
                        allLinks.forEach(link => {
                            link.style.background = '#333'; // remove highlight
                        });
                
                    } else {
                        // New selection -> highlight and filter
                        activeCategoryId = id;
                
                        allCategories.forEach(cat => {
                            const wrapper = cat.closest('.tile-wrapper') || cat;
                            if (wrapper.id === id) {
                                wrapper.style.display = 'block';
                            } else {
                                wrapper.style.display = 'none';
                            }
                        });
                
                        allLinks.forEach(link => {
                            if (link.getAttribute('href') === `#${id}`) {
                                link.style.background = '#555'; // highlighted background
                            } else {
                                link.style.background = '#333'; // normal background
                            }
                        });
                    }
                });
                
                wrapper.appendChild(input);

                catalogList.prepend(wrapper); // or your container

                PSPP_RemoveDuplicates();
                await PSPP_LoadGameNames();

                input.placeholder = 'Search';

                // Listen for input changes
                const games = Array.from(document.querySelectorAll('[data-game]')); // Load once
                
                input.addEventListener('input', () => {
                    const v = input.value.toLowerCase().trim();
                
                    // First filter the games
                    games.forEach((game) => {
                        const wrapper = game.closest('.tile-wrapper') || game;
                        const gameName = game.getAttribute('data-game-name');
                        if ((gameName && gameName.toLowerCase().includes(v)) || v === '') {
                            wrapper.style.display = 'block';
                        } else {
                            wrapper.style.display = 'none';
                        }
                    });
                
                    // Then filter the categories
                    categories.forEach((cat) => {
                        const catWrapper = cat.closest('.tile-wrapper') || cat;
                
                        // Check if this category has any visible games inside it
                        const visibleGames = Array.from(cat.querySelectorAll('.games-list-tile')).some(tile => {
                            const tileWrapper = tile.closest('.tile-wrapper') || tile;
                            return tileWrapper.style.display !== 'none';
                        });
                
                        if (visibleGames) {
                            catWrapper.style.display = 'block';
                        } else {
                            catWrapper.style.display = 'none';
                        }
                    });
                });
                
                startHeaderSyncLoop();
            }
        });

        mobserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

        function waitForElement(selector, callback) {
            const el = document.querySelector(selector);
            if (el) callback(el);
            else requestAnimationFrame(() => waitForElement(selector, callback));
        }
        
        function wrapTile(tile) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('tile-wrapper');
            tile.parentNode.insertBefore(wrapper, tile);
            wrapper.appendChild(tile);
        }
        
        function updateWrapperHeights() {
            const wrappers = document.querySelectorAll('.tile-wrapper');
        
            // Step 1: Remove all inline heights
            wrappers.forEach(wrapper => {
                wrapper.removeAttribute('style');
            });
        
            // Step 2: After short delay, measure ONCE and apply the same height
            setTimeout(() => {
                const firstTile = document.querySelector('.games-list-tile');
                if (!firstTile) return;
        
                const parentWrapper = firstTile.closest('.tile-wrapper');
                if (!parentWrapper) return;
        
                const width = parentWrapper.offsetWidth;
        
                if (width > 0) {
                    wrappers.forEach(wrapper => {
                        wrapper.style.height = `${width}px`;
                    });
                }
            }, 50); // Small delay to let browser reflow
        }
        
        function fadeTo(img, targetOpacity, duration = 300) {
            let start = null;
            const initialOpacity = parseFloat(getComputedStyle(img).opacity) || 0;
        
            function animate(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
        
                const progress = Math.min(elapsed / duration, 1);
                const currentOpacity = initialOpacity + (targetOpacity - initialOpacity) * progress;
        
                img.style.opacity = currentOpacity;
        
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
        
            requestAnimationFrame(animate);
        }

        const tileObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const wrapper = entry.target;
                const tile = wrapper.querySelector('.games-list-tile');
                if (!tile) return;
        
                const img = tile.querySelector('img');
                if (!img) return;
        
                if (entry.isIntersecting) {
                    fadeTo(img, 1, 300); // fade to opacity 1 over 300ms
                    tile.classList.add('visible');
                } else {
                    fadeTo(img, 0, 300); // fade to opacity 0 over 300ms
                    tile.classList.remove('visible');
                }
            });
        }, {
            root: null,
            rootMargin: '600px 0px 600px 0px',
            threshold: 0
        });

        function monitorMainUIModeTransition() {
            const main = document.querySelector('main');
            if (!main) {
                console.warn('<main> element not found!');
                return;
            }
        
            let wasControllerMode = false;
            let hasReloaded = false;
        
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const classes = main.classList;
                        const isController = classes.contains('ui-mode-controller');
                        const isPointer = classes.contains('ui-mode-pointer');
        
                        if (isController) {
                            wasControllerMode = true;
                        }
        
                        if (wasControllerMode && isPointer && !hasReloaded) {
                            console.log('🖱 Transition from controller ➔ pointer detected! FULL PAGE RELOAD.');
                            hasReloaded = true;
                            observer.disconnect(); // Stop watching after triggering
        
                            setTimeout(() => {
                                window.location.reload();
                            }, 200); // small safe delay
                        }
                    }
                }
            });
        
            observer.observe(main, { attributes: true, attributeFilter: ['class'] });
        
            console.log('Now monitoring <main> for controller to pointer transitions...');
        }
        
        function PSPP_WrapTilesAndObserve() {
            waitForElement('#app-outlet', () => {
                waitForElement('.games-list-tile', () => {
                    const tiles = Array.from(document.querySelectorAll('.games-list-tile'));
        
                    tiles.forEach(tile => {
                        if (!tile.parentElement.classList.contains('tile-wrapper')) {
                            wrapTile(tile);
                        }
                    });
        
                    const wrappers = Array.from(document.querySelectorAll('.tile-wrapper'));
        
                    wrappers.forEach(wrapper => {
                        tileObserver.observe(wrapper);
                    });
        
                    waitForTileHeightAndUpdate(); //update once at the end
                    monitorCatalogMutations(); //listen for dynamic changes
                    monitorMainUIModeTransition();

                });
            });
        }
        
        function waitForTileHeightAndUpdate() {
            function check() {
                const tile = document.querySelector('.games-list-tile');
                if (tile && tile.offsetHeight > 0) {
                    //Tile exists and has real height, now update
                    updateWrapperHeights();
                } else {
                    //Keep waiting for the next animation frame
                    requestAnimationFrame(check);
                }
            }
            check();
        }

        PSPP_WrapTilesAndObserve();

        function monitorCatalogMutations() {
            const catalogList = document.querySelector('.catalog-list') || document.querySelector('#app-outlet');
        
            if (!catalogList) return;
        
            const config = { childList: true, subtree: true };
        
            const callback = (mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        const addedOrRemoved = [...mutation.addedNodes, ...mutation.removedNodes];
                        if (addedOrRemoved.some(node => node.nodeType === 1 && (node.classList.contains('MYLIST') || node.classList.contains('PLAYHISTORY')))) {
                            console.log('Detected MYLIST or PLAYHISTORY recreated. Reloading catalog...');
                            PSPP_AssignCategoryIds(Array.from(document.querySelectorAll('.category-tile')))
                            PSPP_WrapTilesAndObserve();
                            break;
                        }
                    }
                }
            };
        
            const observer = new MutationObserver(callback);
        
            observer.observe(catalogList, config);
        }
        
        window.addEventListener('resize', updateWrapperHeights);
        document.querySelector('body').appendChild(newStyle);
    };

    // Load all the lists to retrieve the game names
    const PSPP_LoadGameNames = async () => {
        const promises = [];
        const lists = await PSPP_GetGameLists();
        lists.forEach((el) => {
            const url = `${el}?start=0&size=1000`;
            promises.push(fetch(url).then((response) => response.json()));
        });

        return Promise.all(promises).then((data) => {
            data.forEach(({links}) => {
                links.forEach(({ name, id, playable_platform }) => {
                    const tiles = Array.from(document.querySelectorAll(`[data-game="${id}"]`));
                    tiles.forEach((tile) => {
                        tile.setAttribute('data-game-name', name);
                        if (playable_platform) {
                          tile.setAttribute('data-game-platform', playable_platform.join('/'));
                        }
                    });
                });
            });
        });
    };

    // Get the base url from the store url
    const PSPP_GetBaseUrl = () => {
        return new Promise((resolve) => {
            const newScript = document.createElement('script');
            newScript.innerText = `
              document.body.dataset.kamajiURL = GrandCentral.getConfig().kamajiHostUrl;
            `;
            document.querySelector('body').appendChild(newScript);
            setTimeout(() => {
              const URL = document.querySelector('body').dataset.kamajiURL + 'user/stores';
              fetch(URL)
                  .then((response) => response.json())
                  .then(({data}) => {
                      resolve(data.base_url);
                  });
              });
            }, 100);
    }

    // Use the base url to get the game lists
    const PSPP_GetGameLists = async () => {
        const url = await PSPP_GetBaseUrl();
        return new Promise((resolve) => {
            fetch(url)
                .then((response) => response.json())
                .then(({links}) => {
                    resolve(links.map(({url}) => url));
                });
        });
    }

    // Sliders have duplicates, so we need to remove them
    const PSPP_RemoveDuplicates = () => {
        const sliders = Array.from(document.querySelectorAll('.games-list .slider'));
        sliders.forEach((slider) => {
            const ids = [];
            const children = Array.from(slider.children);
            children.forEach((entry) => {
                const id = entry.getAttribute('data-game');
                if (ids.includes(id)) {
                    entry.remove();
                } else {
                    ids.push(id);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", PSPP_WaitForCatalogListLoad);

class City3DBackground {
    constructor(container) {
        console.log('Initializing City3DBackground');
        console.log('Container:', container);
        
        this.container = container;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (this.isIOS) {
            this.createIOSPermissionUI();
        }
        
        // Получаем настройки из data-атрибутов или глобальных настроек
        this.options = {
            backgroundColor: this.parseColor(container.dataset.backgroundColor || window.city3DSettings?.background_color || '#F02050'),
            fogEnabled: (container.dataset.fogEnabled || window.city3DSettings?.fog_enabled || 'yes') === 'yes',
            fogDensity: parseFloat(container.dataset.fogDensity || window.city3DSettings?.fog_density || 0.05),
            buildingCount: parseInt(container.dataset.buildingCount || window.city3DSettings?.building_count || 100),
            buildingColor: this.parseColor(container.dataset.buildingColor || window.city3DSettings?.building_color || '#000000'),
            buildingWireframeOpacity: parseFloat(container.dataset.buildingWireframeOpacity || window.city3DSettings?.building_wireframe_opacity || 0.03),
            linesEnabled: (container.dataset.linesEnabled || window.city3DSettings?.lines_enabled || 'yes') === 'yes',
            linesCount: parseInt(container.dataset.linesCount || window.city3DSettings?.lines_count || 60),
            linesColor: this.parseColor(container.dataset.linesColor || window.city3DSettings?.lines_color || '#FFFF00'),
            ambientLightIntensity: parseFloat(container.dataset.ambientLightIntensity || window.city3DSettings?.ambient_light_intensity || 4),
            spotLightIntensity: parseFloat(container.dataset.spotLightIntensity || window.city3DSettings?.spot_light_intensity || 20),
            backLightIntensity: parseFloat(container.dataset.backLightIntensity || window.city3DSettings?.back_light_intensity || 0.5),
            rotationSpeed: parseFloat(container.dataset.rotationSpeed || window.city3DSettings?.rotation_speed || 0.001)
        };

        console.log('Options:', this.options);

        try {
            this.init();
            this.setupLights();
            this.createCity();
            if (this.options.linesEnabled) {
                this.generateLines();
            }
            this.animate();
            console.log('City3D initialization completed');
        } catch (error) {
            console.error('Error initializing City3D:', error);
        }
    }

    parseColor(color) {
        return parseInt(color.replace('#', '0x'));
    }

    init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        if (window.innerWidth > 800) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.shadowMap.needsUpdate = true;
        }
        
        this.container.appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();
        const setcolor = this.options.backgroundColor;
        this.scene.background = new THREE.Color(setcolor);
        if (this.options.fogEnabled) {
            this.scene.fog = new THREE.Fog(setcolor, 10, 16);
        }

        // Camera
        this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 500);
        this.camera.position.set(0, 2, 14);

        // Objects
        this.city = new THREE.Object3D();
        this.smoke = new THREE.Object3D();
        this.town = new THREE.Object3D();

        // Определяем, является ли устройство мобильным
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Инициализируем переменные для гироскопа
        if (this.isMobile) {
            this.gyroEnabled = false;
            this.gyroData = {
                alpha: 0,
                beta: 0,
                gamma: 0
            };
            this.smoothedGyro = {
                beta: 0,
                gamma: 0
            };
            this.smoothFactor = 0.1;
            
            // Проверяем поддержку гироскопа
            if (window.DeviceOrientationEvent) {
                if (!this.isIOS) {
                    // Для Android устройств
                    this.enableGyroscope();
                }
                // Для iOS устройств разрешение запрашивается через UI
            }
        }

        // Event listeners только для десктопа
        if (!this.isMobile) {
            window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        }
        
        // Общие event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.mouse = new THREE.Vector2();
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 4);
        this.lightFront = new THREE.SpotLight(0xFFFFFF, 20, 10);
        this.lightBack = new THREE.PointLight(0xFFFFFF, 0.5);

        this.lightFront.rotation.x = 45 * Math.PI / 180;
        this.lightFront.rotation.z = -45 * Math.PI / 180;
        this.lightFront.position.set(5, 5, 5);
        this.lightFront.castShadow = true;
        this.lightFront.shadow.mapSize.width = 6000;
        this.lightFront.shadow.mapSize.height = this.lightFront.shadow.mapSize.width;
        this.lightFront.penumbra = 0.1;

        this.lightBack.position.set(0, 6, 0);
        this.smoke.position.y = 2;

        this.scene.add(this.ambientLight);
        this.city.add(this.lightFront);
        this.scene.add(this.lightBack);
    }

    setTintColor() {
        if (this.setTintNum) {
            this.setTintNum = false;
            return 0x000000;
        } else {
            this.setTintNum = true;
            return 0x000000;
        }
    }

    mathRandom(num = 8) {
        return -Math.random() * num + Math.random() * num;
    }

    createCity() {
        const segments = 2;
        
        for (let i = 1; i < 100; i++) {
            const geometry = new THREE.CubeGeometry(1, 0, 0, segments, segments, segments);
            const material = new THREE.MeshStandardMaterial({
                color: this.setTintColor(),
                wireframe: false,
                side: THREE.DoubleSide
            });
            
            const wmaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                wireframe: true,
                transparent: true,
                opacity: 0.03,
                side: THREE.DoubleSide
            });

            const cube = new THREE.Mesh(geometry, material);
            const wire = new THREE.Mesh(geometry, wmaterial);
            const floor = new THREE.Mesh(geometry, material);
            const wfloor = new THREE.Mesh(geometry, wmaterial);
            
            cube.add(wfloor);
            cube.castShadow = true;
            cube.receiveShadow = true;
            cube.rotationValue = 0.1 + Math.abs(this.mathRandom(8));
            
            floor.scale.y = 0.05;
            cube.scale.y = 0.1 + Math.abs(this.mathRandom(8));
            
            const cubeWidth = 0.9;
            cube.scale.x = cube.scale.z = cubeWidth + this.mathRandom(1-cubeWidth);
            cube.position.x = Math.round(this.mathRandom());
            cube.position.z = Math.round(this.mathRandom());
            
            floor.position.set(cube.position.x, 0, cube.position.z);
            
            this.town.add(floor);
            this.town.add(cube);
        }

        // Ground
        const pmaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            opacity: 0.9,
            transparent: true
        });
        const pgeometry = new THREE.PlaneGeometry(60, 60);
        const pelement = new THREE.Mesh(pgeometry, pmaterial);
        pelement.rotation.x = -90 * Math.PI / 180;
        pelement.position.y = -0.001;
        pelement.receiveShadow = true;

        this.city.add(pelement);
        
        // Add to scene
        this.scene.add(this.city);
        this.city.add(this.smoke);
        this.city.add(this.town);

        // Grid helper
        const gridHelper = new THREE.GridHelper(60, 120, 0xFF0000, 0x000000);
        this.city.add(gridHelper);
    }

    createCars(cScale = 2, cPos = 20, cColor = 0xFFFF00) {
        const cMat = new THREE.MeshToonMaterial({color: cColor, side: THREE.DoubleSide});
        const cGeo = new THREE.CubeGeometry(1, cScale/40, cScale/40);
        const cElem = new THREE.Mesh(cGeo, cMat);
        const cAmp = 3;
        
        if (this.createCarPos) {
            this.createCarPos = false;
            cElem.position.x = -cPos;
            cElem.position.z = this.mathRandom(cAmp);
            
            if (window.TweenMax) {
                TweenMax.to(cElem.position, 3, {x: cPos, repeat: -1, yoyo: true, delay: this.mathRandom(3)});
            }
        } else {
            this.createCarPos = true;
            cElem.position.x = this.mathRandom(cAmp);
            cElem.position.z = -cPos;
            cElem.rotation.y = 90 * Math.PI / 180;
            
            if (window.TweenMax) {
                TweenMax.to(cElem.position, 5, {z: cPos, repeat: -1, yoyo: true, delay: this.mathRandom(3), ease: Power1.easeInOut});
            }
        }
        
        cElem.receiveShadow = true;
        cElem.castShadow = true;
        cElem.position.y = Math.abs(this.mathRandom(5));
        this.city.add(cElem);
    }

    generateLines() {
        for (let i = 0; i < 60; i++) {
            this.createCars(0.1, 20);
        }
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) {
            console.warn('Required 3D objects are not initialized');
            return;
        }

        requestAnimationFrame(this.animate.bind(this));
        
        if (this.city) {
            if (this.isMobile && this.gyroEnabled) {
                // Управление через гироскоп на мобильных устройствах
                const rotationX = (this.smoothedGyro.beta / 180) * 0.5;
                const rotationY = (this.smoothedGyro.gamma / 90) * 0.5;
                
                this.city.rotation.y += (rotationY - this.city.rotation.y) * 0.05;
                this.city.rotation.x += (rotationX - this.city.rotation.x) * 0.05;
                
                // Ограничиваем вращение
                this.city.rotation.x = Math.max(-0.5, Math.min(0.5, this.city.rotation.x));
                this.city.rotation.y = Math.max(-0.5, Math.min(0.5, this.city.rotation.y));
            } else if (!this.isMobile) {
                // Стандартное управление мышью на десктопе
                this.city.rotation.y -= ((this.mouse.x * 8) - this.camera.rotation.y) * this.options.rotationSpeed;
                this.city.rotation.x -= (-(this.mouse.y * 2) - this.camera.rotation.x) * this.options.rotationSpeed;
                
                if (this.city.rotation.x < -0.05) this.city.rotation.x = -0.05;
                else if (this.city.rotation.x > 1) this.city.rotation.x = 1;
            }
        }
        
        if (this.smoke) {
            this.smoke.rotation.y += 0.01;
            this.smoke.rotation.x += 0.01;
        }

        this.camera.lookAt(this.scene.position);
        this.renderer.render(this.scene, this.camera);
    }

    onMouseMove(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        try {
            // Удаляем обработчики событий
            if (!this.isMobile) {
                window.removeEventListener('mousemove', this.onMouseMove.bind(this));
            } else if (this.gyroEnabled) {
                window.removeEventListener('deviceorientation', this.handleGyroscope.bind(this));
            }
            window.removeEventListener('resize', this.onWindowResize.bind(this));

            // Очищаем сцену
            if (this.scene) {
                while(this.scene.children.length > 0){ 
                    this.scene.remove(this.scene.children[0]); 
                }
            }

            // Удаляем рендерер
            if (this.renderer) {
                this.renderer.dispose();
                if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                    this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
                }
            }

            // Очищаем память
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.city = null;
            this.smoke = null;
            this.town = null;
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Добавляем новые методы для работы с гироскопом
    enableGyroscope() {
        this.gyroEnabled = true;
        window.addEventListener('deviceorientation', this.handleGyroscope.bind(this), false);
    }

    handleGyroscope(event) {
        if (!this.gyroEnabled) return;
        
        // Получаем данные гироскопа
        this.gyroData.beta = event.beta;  // Наклон вперед-назад (-180 to 180)
        this.gyroData.gamma = event.gamma; // Наклон влево-вправо (-90 to 90)
        
        // Добавляем проверку на null значения
        if (this.gyroData.beta === null || this.gyroData.gamma === null) {
            return;
        }
        
        // Сглаживаем значения для плавности
        this.smoothedGyro.beta += (this.gyroData.beta - this.smoothedGyro.beta) * this.smoothFactor;
        this.smoothedGyro.gamma += (this.gyroData.gamma - this.smoothedGyro.gamma) * this.smoothFactor;
    }

    createIOSPermissionUI() {
        // Создаем оверлей для запроса разрешения
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const button = document.createElement('button');
        button.textContent = 'Включить 3D управление';
        button.style.cssText = `
            padding: 15px 30px;
            font-size: 16px;
            background: #ffffff;
            border: none;
            border-radius: 5px;
            color: #000000;
            cursor: pointer;
        `;

        overlay.appendChild(button);
        this.container.appendChild(overlay);

        button.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        this.enableGyroscope();
                        overlay.remove();
                    } else {
                        button.textContent = 'Доступ запрещен';
                        button.style.background = '#ff4444';
                        setTimeout(() => overlay.remove(), 2000);
                    }
                })
                .catch(error => {
                    console.error('Error requesting gyroscope permission:', error);
                    button.textContent = 'Ошибка доступа';
                    button.style.background = '#ff4444';
                    setTimeout(() => overlay.remove(), 2000);
                });
        });
    }
}

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, looking for city-3d-container');
    const containers = document.querySelectorAll('.city-3d-container');
    console.log('Found containers:', containers.length);
    
    containers.forEach(container => {
        try {
            new City3DBackground(container);
        } catch (error) {
            console.error('Error creating City3DBackground:', error);
        }
    });
});

// Обработчик для Elementor
if (window.elementorFrontend) {
    elementorFrontend.hooks.addAction('frontend/element_ready/city-3d-background.default', function($element) {
        const container = $element.find('.city-3d-container')[0];
        if (container) {
            // Удаляем старый экземпляр если он существует
            if (container._city3d) {
                container._city3d.destroy();
            }
            // Создаем новый экземпляр
            container._city3d = new City3DBackground(container);
        }
    });
} 
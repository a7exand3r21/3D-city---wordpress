(function($) {
    'use strict';

    console.log('City3D Editor script loaded');

    $(window).on('elementor/frontend/init', function() {
        console.log('Elementor frontend initialized');

        elementorFrontend.hooks.addAction('frontend/element_ready/city-3d-background.default', function($element) {
            console.log('Widget ready:', $element);

            if (typeof window.elementor === 'undefined') {
                console.log('Not in editor mode, initializing normally');
                var $container = $element.find('.city-3d-container');
                if ($container.length) {
                    if ($container[0]._city3d) {
                        console.log('Destroying existing instance');
                        $container[0]._city3d.destroy();
                    }
                    console.log('Creating new instance');
                    $container[0]._city3d = new City3DBackground($container[0]);
                }
                return;
            }

            console.log('In editor mode');
            elementorFrontend.on('components:init', function() {
                console.log('Elementor components initialized');
                
                elementor.channels.editor.on('change', function(view) {
                    console.log('Editor change detected:', view);
                    
                    var $container = $element.find('.city-3d-container');
                    if ($container.length) {
                        // Получаем текущие настройки
                        var settings = elementor.settings.get('settings').attributes;
                        
                        // Обновляем data-атрибуты
                        $container.attr({
                            'data-background-color': settings.background_color,
                            'data-fog-enabled': settings.fog_enabled,
                            'data-fog-density': settings.fog_density.size,
                            'data-building-count': settings.building_count,
                            'data-building-color': settings.building_color,
                            'data-building-wireframe-opacity': settings.building_wireframe_opacity.size,
                            'data-lines-enabled': settings.lines_enabled,
                            'data-lines-count': settings.lines_count,
                            'data-lines-color': settings.lines_color,
                            'data-ambient-light-intensity': settings.ambient_light_intensity.size,
                            'data-spot-light-intensity': settings.spot_light_intensity.size,
                            'data-back-light-intensity': settings.back_light_intensity.size,
                            'data-rotation-speed': settings.rotation_speed.size
                        });

                        // Перезапускаем 3D сцену
                        if ($container[0]._city3d) {
                            $container[0]._city3d.destroy();
                        }
                        $container[0]._city3d = new City3DBackground($container[0]);
                    }
                });
            });
        });
    });

})(jQuery); 
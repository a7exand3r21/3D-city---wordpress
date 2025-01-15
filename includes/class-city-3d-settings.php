<?php
class City_3D_Settings {
    private static $instance = null;
    private $options_prefix = 'city_3d_';

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('elementor/init', [$this, 'register_settings']);
    }

    public function register_settings() {
        // Регистрируем настройки в Elementor
        add_option($this->options_prefix . 'background_color', '#F02050');
        add_option($this->options_prefix . 'fog_enabled', 'yes');
        add_option($this->options_prefix . 'fog_density', 0.05);
        add_option($this->options_prefix . 'building_count', 100);
        add_option($this->options_prefix . 'building_color', '#000000');
        add_option($this->options_prefix . 'building_wireframe_opacity', 0.03);
        add_option($this->options_prefix . 'lines_enabled', 'yes');
        add_option($this->options_prefix . 'lines_count', 60);
        add_option($this->options_prefix . 'lines_color', '#FFFF00');
        add_option($this->options_prefix . 'ambient_light_intensity', 4);
        add_option($this->options_prefix . 'spot_light_intensity', 20);
        add_option($this->options_prefix . 'back_light_intensity', 0.5);
        add_option($this->options_prefix . 'rotation_speed', 0.001);
    }

    public function get_setting($key, $default = '') {
        return get_option($this->options_prefix . $key, $default);
    }

    public function update_setting($key, $value) {
        return update_option($this->options_prefix . $key, $value);
    }

    public function get_all_settings() {
        return [
            'background_color' => $this->get_setting('background_color'),
            'fog_enabled' => $this->get_setting('fog_enabled'),
            'fog_density' => $this->get_setting('fog_density'),
            'building_count' => $this->get_setting('building_count'),
            'building_color' => $this->get_setting('building_color'),
            'building_wireframe_opacity' => $this->get_setting('building_wireframe_opacity'),
            'lines_enabled' => $this->get_setting('lines_enabled'),
            'lines_count' => $this->get_setting('lines_count'),
            'lines_color' => $this->get_setting('lines_color'),
            'ambient_light_intensity' => $this->get_setting('ambient_light_intensity'),
            'spot_light_intensity' => $this->get_setting('spot_light_intensity'),
            'back_light_intensity' => $this->get_setting('back_light_intensity'),
            'rotation_speed' => $this->get_setting('rotation_speed'),
        ];
    }
} 
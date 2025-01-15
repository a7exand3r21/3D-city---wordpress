<?php
/**
 * Plugin Name: City 3D Background
 * Description: 3D City background with Elementor support
 * Version: 1.0.0
 * Author: Alexandr Sharshavin aka a7exsh
 * Text Domain: city-3d-background
 */

if (!defined('ABSPATH')) exit;

class City_3D_Background {
    private static $_instance = null;
    private $settings = null;

    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function __construct() {
        add_action('plugins_loaded', [$this, 'init']);
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
    }

    public function init() {
        // Load settings
        require_once(__DIR__ . '/includes/class-city-3d-settings.php');
        $this->settings = City_3D_Settings::instance();

        // Check for Elementor
        if (!did_action('elementor/loaded')) {
            add_action('admin_notices', [$this, 'admin_notice_missing_elementor']);
            return;
        }

        // Register widget
        add_action('elementor/widgets/widgets_registered', function() {
            require_once(__DIR__ . '/includes/class-city-3d-widget.php');
            \Elementor\Plugin::instance()->widgets_manager->register_widget_type(new City_3D_Widget());
        });

        // Register scripts and styles
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        
        // Add settings link to plugins page
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_settings_link']);
    }

    public function activate() {
        // Активация плагина - инициализация настроек по умолчанию
        if (!get_option('city_3d_initialized')) {
            require_once(__DIR__ . '/includes/class-city-3d-settings.php');
            $settings = City_3D_Settings::instance();
            $settings->register_settings();
            update_option('city_3d_initialized', true);
        }
    }

    public function deactivate() {
        // Можно добавить очистку настроек при деактивации если нужно
    }

    public function admin_notice_missing_elementor() {
        if (isset($_GET['activate'])) unset($_GET['activate']);
        $message = sprintf(
            esc_html__('"%1$s" requires "%2$s" to be installed and activated.', 'city-3d-background'),
            '<strong>' . esc_html__('City 3D Background', 'city-3d-background') . '</strong>',
            '<strong>' . esc_html__('Elementor', 'city-3d-background') . '</strong>'
        );
        printf('<div class="notice notice-warning is-dismissible"><p>%1$s</p></div>', $message);
    }

    public function enqueue_scripts() {
        wp_enqueue_script('three-js', 
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js', 
            [], 
            null, 
            true
        );

        wp_enqueue_script('tweenmax', 
            'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js', 
            [], 
            '1.20.3', 
            true
        );

        wp_enqueue_script('city-3d', 
            plugins_url('assets/js/city-3d.js', __FILE__), 
            ['three-js', 'tweenmax'], 
            '1.0.0', 
            true
        );

        // Передаем настройки в JavaScript
        wp_localize_script('city-3d', 'city3DSettings', $this->settings->get_all_settings());

        wp_enqueue_style('city-3d', 
            plugins_url('assets/css/city-3d.css', __FILE__), 
            [], 
            '1.0.0'
        );
    }

    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=elementor#tab-style') . '">' . __('Settings', 'city-3d-background') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    public function get_settings() {
        return $this->settings;
    }
}

City_3D_Background::instance(); 

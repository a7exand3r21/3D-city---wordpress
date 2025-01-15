<?php
class City_3D_Widget extends \Elementor\Widget_Base {
    public function get_name() {
        return 'city-3d-background';
    }

    public function get_title() {
        return __('3D City Background', 'city-3d-background');
    }

    public function get_icon() {
        return 'eicon-parallax';
    }

    public function get_categories() {
        return ['basic'];
    }

    public function __construct($data = [], $args = null) {
        parent::__construct($data, $args);

        // Регистрируем скрипты для редактора
        add_action('elementor/frontend/after_register_scripts', [$this, 'register_editor_scripts']);
        add_action('elementor/preview/enqueue_scripts', [$this, 'enqueue_editor_scripts']);
    }

    public function register_editor_scripts() {
        // Register Three.js
        wp_register_script(
            'three-js',
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js',
            [],
            '89',
            true
        );

        // Register TweenMax
        wp_register_script(
            'tweenmax',
            'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js',
            [],
            '1.20.3',
            true
        );

        // Register main City3D script
        wp_register_script(
            'city-3d',
            plugins_url('/assets/js/city-3d.js', dirname(__FILE__)),
            ['three-js', 'tweenmax'],
            '1.0.0',
            true
        );

        // Register editor script
        wp_register_script(
            'city-3d-editor',
            plugins_url('/assets/js/city-3d-editor.js', dirname(__FILE__)),
            ['elementor-frontend', 'jquery', 'city-3d'],
            '1.0.0',
            true
        );
    }

    public function enqueue_editor_scripts() {
        if (\Elementor\Plugin::$instance->editor->is_edit_mode()) {
            wp_enqueue_script('three-js');
            wp_enqueue_script('tweenmax');
            wp_enqueue_script('city-3d');
            wp_enqueue_script('city-3d-editor');
        }
    }

    protected function _register_controls() {
        // Scene Settings
        $this->start_controls_section(
            'scene_settings',
            [
                'label' => __('Scene Settings', 'city-3d-background'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'background_color',
            [
                'label' => __('Background Color', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#F02050',
            ]
        );

        $this->add_control(
            'fog_enabled',
            [
                'label' => __('Enable Fog', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'fog_density',
            [
                'label' => __('Fog Density', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [
                    'px' => ['min' => 0.01, 'max' => 0.1, 'step' => 0.01],
                ],
                'default' => ['size' => 0.05],
                'condition' => ['fog_enabled' => 'yes'],
            ]
        );

        $this->end_controls_section();

        // Buildings Settings
        $this->start_controls_section(
            'buildings_settings',
            [
                'label' => __('Buildings', 'city-3d-background'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'building_count',
            [
                'label' => __('Number of Buildings', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::NUMBER,
                'min' => 10,
                'max' => 200,
                'step' => 10,
                'default' => 100,
            ]
        );

        $this->add_control(
            'building_color',
            [
                'label' => __('Building Color', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#000000',
            ]
        );

        $this->add_control(
            'building_wireframe_opacity',
            [
                'label' => __('Wireframe Opacity', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [
                    'px' => ['min' => 0, 'max' => 1, 'step' => 0.01],
                ],
                'default' => ['size' => 0.03],
            ]
        );

        $this->end_controls_section();

        // Lines Settings
        $this->start_controls_section(
            'lines_settings',
            [
                'label' => __('Moving Lines', 'city-3d-background'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'lines_enabled',
            [
                'label' => __('Enable Moving Lines', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'lines_count',
            [
                'label' => __('Number of Lines', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::NUMBER,
                'min' => 0,
                'max' => 100,
                'step' => 5,
                'default' => 60,
                'condition' => ['lines_enabled' => 'yes'],
            ]
        );

        $this->add_control(
            'lines_color',
            [
                'label' => __('Lines Color', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'default' => '#FFFF00',
                'condition' => ['lines_enabled' => 'yes'],
            ]
        );

        $this->end_controls_section();

        // Lighting Settings
        $this->start_controls_section(
            'lighting_settings',
            [
                'label' => __('Lighting', 'city-3d-background'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'ambient_light_intensity',
            [
                'label' => __('Ambient Light Intensity', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [
                    'px' => ['min' => 0, 'max' => 10, 'step' => 0.1],
                ],
                'default' => ['size' => 4],
            ]
        );

        $this->add_control(
            'spot_light_intensity',
            [
                'label' => __('Spot Light Intensity', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [
                    'px' => ['min' => 0, 'max' => 50, 'step' => 1],
                ],
                'default' => ['size' => 20],
            ]
        );

        $this->add_control(
            'back_light_intensity',
            [
                'label' => __('Back Light Intensity', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [
                    'px' => ['min' => 0, 'max' => 2, 'step' => 0.1],
                ],
                'default' => ['size' => 0.5],
            ]
        );

        $this->end_controls_section();

        // Animation Settings
        $this->start_controls_section(
            'animation_settings',
            [
                'label' => __('Animation', 'city-3d-background'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'rotation_speed',
            [
                'label' => __('Rotation Speed', 'city-3d-background'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'range' => [
                    'px' => ['min' => 0, 'max' => 0.01, 'step' => 0.001],
                ],
                'default' => ['size' => 0.001],
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        ?>
        <div class="city-3d-container" style="width: 100%; height: 100vh;"
             data-background-color="<?php echo esc_attr($this->get_settings('background_color')); ?>"
             data-fog-enabled="<?php echo esc_attr($this->get_settings('fog_enabled')); ?>"
             data-fog-density="<?php echo esc_attr($this->get_settings('fog_density.size')); ?>"
             data-building-count="<?php echo esc_attr($this->get_settings('building_count')); ?>"
             data-building-color="<?php echo esc_attr($this->get_settings('building_color')); ?>"
             data-building-wireframe-opacity="<?php echo esc_attr($this->get_settings('building_wireframe_opacity.size')); ?>"
             data-lines-enabled="<?php echo esc_attr($this->get_settings('lines_enabled')); ?>"
             data-lines-count="<?php echo esc_attr($this->get_settings('lines_count')); ?>"
             data-lines-color="<?php echo esc_attr($this->get_settings('lines_color')); ?>"
             data-ambient-light-intensity="<?php echo esc_attr($this->get_settings('ambient_light_intensity.size')); ?>"
             data-spot-light-intensity="<?php echo esc_attr($this->get_settings('spot_light_intensity.size')); ?>"
             data-back-light-intensity="<?php echo esc_attr($this->get_settings('back_light_intensity.size')); ?>"
             data-rotation-speed="<?php echo esc_attr($this->get_settings('rotation_speed.size')); ?>">
        </div>
        <?php
    }
} 
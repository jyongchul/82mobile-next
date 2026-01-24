<?php
/**
 * Plugin Name: 82mobile CORS Headers
 * Description: Enable CORS for Next.js frontend API access
 * Version: 1.0.0
 * Author: Whitehat Marketing
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add CORS headers to WordPress REST API
 * This allows the Next.js frontend to access the WooCommerce API
 */
add_action('rest_api_init', function() {
    // Remove default CORS headers
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    // Add custom CORS headers
    add_filter('rest_pre_serve_request', function($value) {
        // Allow requests from Next.js frontend
        $allowed_origins = [
            'https://82mobile.com',
            'https://www.82mobile.com',
            'http://localhost:3000', // Development
            'https://new.82mobile.com', // Staging
        ];

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');

        return $value;
    });
}, 15);

/**
 * Handle preflight OPTIONS requests
 */
add_action('init', function() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});

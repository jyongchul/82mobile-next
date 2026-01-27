<?php
// Test Redis connectivity on Gabia hosting

$redis_available = false;
$error_message = '';

// Test 1: Check if Redis extension loaded
if (extension_loaded('redis')) {
    echo "✓ PHP Redis extension loaded\n";

    // Test 2: Try connection to common Redis hosts
    $hosts = ['localhost', '127.0.0.1', 'redis'];
    foreach ($hosts as $host) {
        try {
            $redis = new Redis();
            if ($redis->connect($host, 6379, 1)) {
                echo "✓ Redis connection successful: $host:6379\n";
                $redis_available = true;
                break;
            }
        } catch (Exception $e) {
            $error_message .= "✗ $host:6379 - " . $e->getMessage() . "\n";
        }
    }
} else {
    $error_message = "✗ PHP Redis extension not loaded\n";
}

// Output JSON result
echo json_encode([
    'available' => $redis_available,
    'error' => $error_message,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>

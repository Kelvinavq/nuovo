<?php
// Incluye la biblioteca de Pusher
require 'vendor/autoload.php';

// Configuración de Pusher
$options = array(
    'cluster' => 'mt1',
    'useTLS' => true
);

$pusher = new Pusher\Pusher(
    'afe7fd857579ff4b05d7',
    '5803e9b3897ca2f83f8c',
    '1747968',
    $options
);

// $notificationData = array('message' => '¡Nueva notificación recibida!');
// $pusher->trigger('notifications-channel', 'evento', $notificationData);
?>
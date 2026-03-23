
<?php
/**
 * Solero Basto Configurator - Email Submission Script
 * Geoptimaliseerd voor Plesk (PHP-FPM/Nginx) op PHP 8.3
 */

// Voorkom dat fouten direct naar de browser worden geprint (breekt JSON)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Buffer alle output zodat we die kunnen schoonmaken voor het verzenden van JSON
ob_start();

// Headers voor JSON en CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// Afhandeling van preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// Controleer of het een POST request is
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_end_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Haal de data op
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['customer'])) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Geen geldige data ontvangen.']);
    exit;
}

// Configuratie
$to = "info@parasols.nl";
$customer = $data['customer'];

// Gebruik de volledige tekst als die er is
if (!empty($data['fullEmailText'])) {
    $message = $data['fullEmailText'];
} else {
    // Fallback voor als fullEmailText ontbreekt
    $config = $data['config'] ?? [];
    $message = "OFFERTE AANVRAAG\n====================\n\n";
    $message .= "Naam: " . ($customer['name'] ?? '-') . "\n";
    $message .= "E-mail: " . ($customer['email'] ?? '-') . "\n\n";
    
    foreach ($config as $key => $val) {
        if (strpos($key, 'Parasol') === 0) {
            $message .= "$key:\n$val\n\n";
        }
    }
    $message .= "Totaal: € " . ($config['totalPrice'] ?? '0,00');
}

// Voor Plesk is het essentieel dat de 'From' een domein-gebaseerd adres is
$from_email = "configurator@parasols.be"; 
$subject = "Offerte aanvraag Solero Basto - " . ($customer['name'] ?? 'Klant');

// Headers
$headers = [
    "From: Solero Configurator <" . $from_email . ">",
    "Reply-To: " . ($customer['name'] ?? 'Klant') . " <" . ($customer['email'] ?? $from_email) . ">",
    "X-Mailer: PHP/" . phpversion(),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8"
];

// Verstuur de mail
$success = mail($to, $subject, $message, implode("\r\n", $headers), "-f " . $from_email);

ob_end_clean();

if ($success) {
    http_response_code(200);
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Mail verzending mislukt via de server.']);
}
exit;
?>

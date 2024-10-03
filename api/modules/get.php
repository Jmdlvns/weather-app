<?php

require_once "global.php";
require_once __DIR__ . '/../../vendor/autoload.php';

// Load .env variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../config');
$dotenv->load();

class Get extends GlobalMethod {

    private $apiKey;
    private $apiUrl;

    public function __construct() {
        $this->apiKey = $_ENV['API_KEY'];
        $this->apiUrl = $_ENV['API_URL'];
    }

    public function fetchWeather($city, $days = 5) {
        $url = "{$this->apiUrl}?key={$this->apiKey}&q={$city}&days={$days}";
        return $this->fetchWeatherFromUrl($url);
    }

    public function searchWeatherByCoords($latitude, $longitude, $days = 5) {
        $url = "{$this->apiUrl}?key={$this->apiKey}&q={$latitude},{$longitude}&days={$days}";
        return $this->fetchWeatherFromUrl($url);
    }

    public function getCitySuggestions($query) {
        $url = "{$this->apiUrl}/search.json?key={$this->apiKey}&q={$query}";
        return $this->fetchWeatherFromUrl($url);
    }      

    private function fetchWeatherFromUrl($url) {
        error_log("Fetching weather data from URL: $url");
        $response = @file_get_contents($url);

        if ($response === false) {
            return [
                'status' => 'error',
                'message' => 'Failed to fetch weather data from the API.'
            ];
        }

        $decodedResponse = json_decode($response, true);

        if ($decodedResponse === null) {
            return [
                'status' => 'error',
                'message' => 'Failed to decode weather data from the API.'
            ];
        }

        return $decodedResponse;
    }
}

?>

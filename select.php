<?php
	include 'connection.php';

	if ($_SERVER["REQUEST_METHOD"] == "POST") {
	    try {
	        $jsonData = file_get_contents("php://input");
	        if ($jsonData === false) {
	            throw new Exception("Error reading input data");
	        }

	        $data = json_decode($jsonData, true);
	        if ($data === null) {
	            throw new Exception("Error decoding JSON data");
	        }
	        $city = $data['city'];
			$query = "SELECT 
					MAX(id) as id, city, country, temperature, weather_condition, humidity, pressure, wind, sunrise, sunset,
					MAX(time_accessed) AS time_accessed, day_accessed, MAX(date_accessed) AS date_accessed, icon
				FROM 
					weather
				WHERE 
					city = '$city' AND date_accessed >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
				GROUP BY 
					DATE(date_accessed)
				ORDER BY 
					date_accessed DESC;";

			$sql = mysqli_query($conn, $query);
			$rows = array();

			while ($row = mysqli_fetch_assoc($sql)) {
			    $rows[] = $row;
			}

			header('Content-Type: application/json');
			echo json_encode($rows);
	        $conn->close();
	    } catch (Exception $e) {
	        http_response_code(400);
	        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
	    }
	} else {
	    http_response_code(405);
	    echo json_encode(['success' => false, 'error' => 'Only POST requests are allowed']);
	}

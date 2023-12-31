<?php
	// Include connection
	include 'connection.php';
	// Get data from POST
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
	    try {
			// City name from url
	        $jsonData = file_get_contents("php://input");
	        if ($jsonData === false) {
	            throw new Exception("Error reading input data");
	        }

	        $data = json_decode($jsonData, true);
	        if ($data === null) {
	            throw new Exception("Error decoding JSON data");
	        }
	        $city = $data['city'];
			// SQL query
			$query = "SELECT *
				FROM 
					weather
				WHERE 
					city = '$city' AND date_accessed BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()
				GROUP BY 
					DATE(date_accessed)
				ORDER BY 
					date_accessed DESC;";
			// Query exceution
			$sql = mysqli_query($conn, $query);
			$rows = array();
			// Collecting rows
			while ($row = mysqli_fetch_assoc($sql)) {
			    $rows[] = $row;
			}
			// Send data back
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

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $targetDir = "uploads/";
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $fileName = basename($_FILES["media"]["name"]);
    $targetFilePath = $targetDir . $fileName;

    // Check if the file is uploaded
    if (move_uploaded_file($_FILES["media"]["tmp_name"], $targetFilePath)) {
        // Database connection
        $conn = new mysqli("localhost", "username", "password", "database_name");
        if ($conn->connect_error) {
            die("Database connection failed: " . $conn->connect_error);
        }

        // Save file path to the database
        $stmt = $conn->prepare("INSERT INTO media (file_path) VALUES (?)");
        $stmt->bind_param("s", $targetFilePath);
        if ($stmt->execute()) {
            echo "File uploaded successfully!";
        } else {
            echo "Error saving file to database.";
        }
        $stmt->close();
        $conn->close();
    } else {
        echo "Error uploading file.";
    }
} else {
    echo "Invalid request.";
}
?>

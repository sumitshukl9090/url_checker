<?php
require_once '../config/config.php';


do {
    // Fetch the next batch of 10 URLs
$query = $pdo->query("
    SELECT offense_chaturbate_id, url, offense_id 
    FROM offense_chaturbate 
    WHERE is_live = 1 
    AND url REGEXP 'lpsg'
    ORDER BY offense_chaturbate_id DESC 
    LIMIT 10
");

    $urls = $query->fetchAll();

    // Break the loop if no more URLs to process
    if (empty($urls)) {
        break;
    }

    foreach ($urls as $row) {
        $id = $row['offense_chaturbate_id'];
        $url = $row['url'];
        $offense_id = $row['offense_id'];

        echo "Processing ID: $id | URL: $url\n";
      
        // Run Puppeteer script to check video status
        $output = shell_exec("node ../headless_browser/check_video.js " . escapeshellarg($url));

        // Normalize Puppeteer output and determine is_live status
        $is_live = trim($output) === '1' ? 1 : 0;

        // Update database with new is_live status
        $update = $pdo->prepare("UPDATE offense_chaturbate SET is_live = :is_live, last_checked = NOW() WHERE offense_chaturbate_id = :id");
        $update->execute([':is_live' => $is_live, ':id' => $id]);

        $update = $pdo->prepare("UPDATE offense SET is_live = :is_live WHERE offense_id = :offense_id");
        $update->execute([':is_live' => $is_live, ':offense_id' => $offense_id]);

        // Log the result
        file_put_contents(
            "../logs/log.txt",
            "ID: $id | URL: $url | Puppeteer Output: $output | Updated is_live: $is_live\n",
            FILE_APPEND
        );

        echo "Updated is_live: $is_live for ID: $id | URL: $url | offense_id: $offense_id\n";
    }

    // Pause for a moment to avoid overwhelming the database or external script
    sleep(30);

} while (true);

echo "Video verification completed. Check logs for details.\n";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sound Samples</title>
    <style>
        /* Add your CSS styles here */
        .grid-container {
            display: grid;
            grid-template-columns: auto repeat(4, 1fr); /* 7 columns (including the row number) */
            gap: 10px;
            margin: 20px;
        }
        .grid-header {
            text-align: center;
            font-weight: bold;
        }
        .grid-item {
            text-align: center;
            display: flex;
            align-items: center; /* Center-align vertically */
        }
        audio {
            width: 100%;
        }
        .description {
            /* font-weight: bold; */
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <a href="synthesis_examples.php">Link: Examples of Alexia and Tricky dataset synthesis</a>
    <br>
    <p>Examples from the 100-Tricky Dataset where the synthesised speech made errrors</p>
    <br>
    <div class="grid-container">
        <?php
        // Define an array with headers and sound file paths
        $soundData = array(
            array("Sample", "Error Sample", "Good Example", "Trasnscript", "Description"),
            array(
                "1",
                "media/web_examples/wer_examples/test-v08-1-bd.wav",
                "media/web_examples/wer_examples/test-v09-1-gd.wav",
                "A backbone contests the chaos",
                "backbone and chaos are mispronounced by the w2v_pt_L12 model",
            ),
            array(
                "2",
                "media/web_examples/wer_examples/test-v08-2-bd.wav",
                "media/web_examples/wer_examples/test-mel-2-gd.wav",
                "Every farewell explodes the career",
                "farewell and career mispronounced by w2v_pt_L12 model",
            ),
            array(
                "3",
                "media/web_examples/wer_examples/test-v09-3-bd.wav",
                "media/web_examples/wer_examples/test-v10-3-gd.wav",
                "On August 28th, Mary playes the piano",
                "piano mispronounced by w2v_ft_L09 model",
            ),
            // Add more rows here
        );

        // Loop through the array and generate grid items
        foreach ($soundData as $data) {
            foreach ($data as $key => $value) {
                if (strpos($value, '.wav') !== false) {
                    echo '<div class="grid-item">';
                    echo '<audio controls>';
                    echo '<source src="' . $value . '" type="audio/wav">';
                    echo 'Your browser does not support the audio element.';
                    echo '</audio>';
                    echo '</div>';
                } else {
                    if ($key === 0) {
                        echo '<div class="grid-header">' . $value . '</div>';
                    } else {
                        echo '<div class="grid-item">' . $value . '</div>';
                    }
                }
            }
        }
        ?>
    </div>
</body>
</html>

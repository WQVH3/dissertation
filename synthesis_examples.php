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
            grid-template-columns: auto repeat(5, 1fr); /* 7 columns (including the row number) */
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
    <a href="synthesis_errors.php">Link: Examples of synthesis errors</a>
    <br>
    <p>Examples from the Alexia evaluation dataset, and from the 100 sentence Tricky Dataset</p>
    <p>Note, there are no Human Reference speech samples for the 100 sentence Tricky Dataset because it is only a dataset of text</p>
    <br>
    <div class="grid-container">
        <?php
        // Define an array with headers and sound file paths
        $soundData = array(
            array("Sample", "Human Reference", "mel-spectrogram", "w2v_pt_L12", "w2v_pt_L09", "w2v_ft_L09"),
            array(
                "Alexia Dataset - 1",
                "media/web_examples/eval_alexia/alex-ref-1.wav",
                "media/web_examples/eval_alexia/alex-mel-1.wav",
                "media/web_examples/eval_alexia/alex-v08-1.wav",
                "media/web_examples/eval_alexia/alex-v10-1.wav",
                "media/web_examples/eval_alexia/alex-v09-1.wav",
            ),
            array(
                "Alexia Dataset - 2",
                "media/web_examples/eval_alexia/alex-ref-3.wav",
                "media/web_examples/eval_alexia/alex-mel-3.wav",
                "media/web_examples/eval_alexia/alex-v08-3.wav",
                "media/web_examples/eval_alexia/alex-v10-3.wav",
                "media/web_examples/eval_alexia/alex-v09-3.wav",
            ),
            array(
                "Alexia Dataset - 3",
                "media/web_examples/eval_alexia/alex-ref-4.wav",
                "media/web_examples/eval_alexia/alex-mel-4.wav",
                "media/web_examples/eval_alexia/alex-v08-4.wav",
                "media/web_examples/eval_alexia/alex-v10-4.wav",
                "media/web_examples/eval_alexia/alex-v09-4.wav",
            ),
            array(
                "Tricky Dataset - 1",
                "",
                "media/web_examples/tricky_text/tric-mel-1.wav",
                "media/web_examples/tricky_text/tric-v08-1.wav",
                "media/web_examples/tricky_text/tric-v10-1.wav",
                "media/web_examples/tricky_text/tric-v09-1.wav",
            ),
            array(
                "Tricky Dataset - 2",
                "",
                "media/web_examples/tricky_text/tric-mel-2.wav",
                "media/web_examples/tricky_text/tric-v08-2.wav",
                "media/web_examples/tricky_text/tric-v10-2.wav",
                "media/web_examples/tricky_text/tric-v09-2.wav",
            ),
            array(
                "Tricky Dataset - 3",
                "",
                "media/web_examples/tricky_text/tric-mel-3.wav",
                "media/web_examples/tricky_text/tric-v08-3.wav",
                "media/web_examples/tricky_text/tric-v10-3.wav",
                "media/web_examples/tricky_text/tric-v09-3.wav",
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

rm test-slides.surge.sh_*.report.html
echo "Wait for test to start..."
lighthouse https://test-slides.surge.sh
echo "Opening test results..."
open test-slides.surge.sh_*.report.html

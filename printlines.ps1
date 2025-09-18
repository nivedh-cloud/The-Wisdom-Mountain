$lines = Get-Content "src\styles\GlobalStyles.css"
for ($i=886; $i -le 896; $i++) {
  $ln = $i + 1
  Write-Output ("{0}: {1}" -f $ln, $lines[$i])
}
